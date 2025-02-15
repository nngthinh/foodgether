import { useRouter } from "next/router";
import { Photo, SharedPropsFromServer } from "../../../types/shared";
import { Box, Divider, Stack, VStack } from "@chakra-ui/react";
import { get, group, isEmpty, mapValues, objectify } from "radash";
import Head from "next/head";
import RestaurantHeader from "../../../components/invitation/RestaurantHeader";
import RestaurantMenuSection from "../../../components/invitation/RestaurantMenuSection";
import RestaurantMenu from "../../../components/invitation/RestaurantMenu";
import { useTranslation } from "react-i18next";
import FloatingCart from "../../../components/invitation/FloatingCart";
import { createContext, RefObject, useEffect, useRef } from "react";
import {
  getAllRecentInvitationIds,
  getInvitationForMember,
} from "../../../server/db/invitation";
import useStore from "../../../hooks/store";
import { trpc } from "../../../utils/trpc";
import { VirtuosoHandle } from "react-virtuoso";
import { InvitationOptionDictDishData } from "../../../hooks/store/optionDict";
import { InvitationDishWithPriceAndPhoto } from "../../../types/dish";
import { RestaurantInInvitation } from "../../../types/restaurant";
import { GetStaticPropsResult } from "next";

export async function getStaticPaths() {
  const invitationIds = await getAllRecentInvitationIds();

  return {
    paths: invitationIds.map((id) => ({ params: { id } })),
    fallback: true,
  };
}

type GetRestaurantServerParams = SharedPropsFromServer & {
  params: {
    id: string;
  };
};

export const getStaticProps = async ({
  params: { id },
}: GetRestaurantServerParams): Promise<
  GetStaticPropsResult<InvitationPageProps>
> => {
  const invitation = await getInvitationForMember(id);

  if (!invitation) {
    return {
      props: {
        // invitation: null,
      },
      revalidate: 60,
    };
  }
  const restaurant = invitation.invitationRestaurant;
  const dishOptions = restaurant?.invitationDishes.flatMap(
    (dish) => dish.invitationDishOptions
  );

  const dishDict = objectify(
    restaurant?.invitationDishes || [],
    (dish) => dish.id
  ) as {
    [dishId: string]: InvitationDishWithPriceAndPhoto;
  };
  const optionDict = objectify(
    restaurant?.invitationOptions || [],
    (option) => option.id
  );
  const groupedDict = group(dishOptions || [], (option) => option.dishId);
  const dishOptionDict: InvitationOptionDictDishData = mapValues(
    groupedDict,
    (options) =>
      objectify(
        options || [],
        (option) => option.optionId,
        (option) => ({
          ...optionDict[option.optionId]!,
          invitationOptionItems: objectify(
            optionDict[option.optionId]!.invitationOptionItems,
            (item) => item.id
          ),
        })
      )
  );
  const invitationRestaurant = invitation.invitationRestaurant!;
  return {
    props: {
      invitation,
      optionDict: dishOptionDict,
      dishDict,
      dishList: objectify(
        invitationRestaurant.invitationDishTypes,
        (dishType) => dishType.id,
        (dishType) =>
          dishType.invitationDishTypeAndDishes.map((dish) => dish.dishId)
      ),
    },
    revalidate: 60,
  };
};

type InvitationPageProps = {
  invitation?: Awaited<ReturnType<typeof getInvitationForMember>>;
  optionDict?: InvitationOptionDictDishData;
  dishDict?: {
    [dishId: string]: InvitationDishWithPriceAndPhoto;
  };
  dishList?: {
    [dishTypeId: string]: number[];
  };
};

export const VirtuosoRefContext =
  createContext<null | RefObject<VirtuosoHandle>>(null);

const InvitationPage = ({
  invitation,
  optionDict,
  dishDict,
  dishList,
}: InvitationPageProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { setOptionDict, setDishDict, setCart, setRestaurant } = useStore(
    (state) => ({
      setOptionDict: state.optionDict.setOptionDictForInvitationPage,
      setDishDict: state.dishDict.setDishDictForInvitationPage,
      setCart: state.cart.setCart,
      setRestaurant: state.restaurant.setRestaurantForInvitationPage,
    })
  );

  const virtuosoRef = useRef(null);

  const restaurant = invitation?.invitationRestaurant as
    | RestaurantInInvitation
    | undefined
    | null;
  const restaurantId = restaurant?.id || -1;
  const invitationId = (router.query.id ||
    router.pathname.split("/").pop()) as string;

  // const confirmedRestaurant = useMemo(() => {
  //   return (restaurant || {}) as NonNullable<AggregatedRestaurant>;
  // }, [restaurant]);

  const cartQuery = trpc.order.getMemberCurrentOrder.useQuery(
    {
      invitationId,
      restaurantId,
    },
    {
      enabled: !isEmpty(restaurant),
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (!isEmpty(cartQuery.data) && cartQuery.data) {
      setCart(cartQuery.data);
    }
  }, [cartQuery.data]);

  useEffect(() => {
    if (restaurant && optionDict && dishDict) {
      setOptionDict(restaurant.id, optionDict);
      setDishDict(restaurant.id, dishDict);
      setRestaurant(restaurant);
    }
  }, [restaurant?.id]);

  const restaurantPhotos = get(restaurant, "photos", []) as Photo[];
  const restaurantHeaderImage = restaurantPhotos[restaurantPhotos.length - 1];

  const description = t("invitation_page.invitation_description", {
    name: restaurant?.name,
  }) as string;

  if (!restaurant || !dishList || !optionDict || !dishDict) {
    return null;
  }
  const { name, address, priceRange, isAvailable, url } = restaurant;
  return (
    <>
      <Head>
        <title>{description}</title>
        <meta name="description" content={description} />
      </Head>
      <main style={{ width: "100%" }}>
        <VStack width="100%">
          <RestaurantHeader
            photo={restaurantHeaderImage}
            name={name}
            address={address}
            priceRange={priceRange}
            isAvailable={isAvailable}
            url={url}
            restaurantId={restaurantId}
            invitationId={invitationId}
          />
          <Box width="full" mt={1} paddingX={4}>
            <Divider orientation="horizontal" />
          </Box>
          <Stack
            direction={["column", "column", "row"]}
            width="100%"
            paddingX={4}
            alignItems={["center", "center", "flex-start"]}
          >
            <VirtuosoRefContext.Provider value={virtuosoRef}>
              <RestaurantMenuSection
                dishTypes={restaurant.invitationDishTypes}
              />
              <RestaurantMenu
                dishTypes={restaurant.invitationDishTypes}
                restaurantId={restaurantId}
                dishList={dishList || {}}
              />
            </VirtuosoRefContext.Provider>
          </Stack>
        </VStack>
        <FloatingCart
          invitationId={invitationId}
          previousCart={cartQuery.data}
        />
      </main>
    </>
  );
};

export default InvitationPage;

import {
  Box,
  Button,
  Card,
  CardBody,
  Img,
  Stack,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { isEmpty } from "radash";
import { FunctionComponent, useEffect } from "react";
import { useTranslation } from "react-i18next";
import useStore from "../../hooks/store";
import { DishWithPriceAndPhoto } from "../../types/dish";
import { listifyOptions } from "../../utils/transform";
import { trpc } from "../../utils/trpc";
import ItemOptionModal from "./ItemOptionModal";

type RestaurantMenuItemProps = {
  dish?: DishWithPriceAndPhoto;
  restaurantId: number;
};

const RestaurantMenuItem: FunctionComponent<RestaurantMenuItemProps> = ({
  dish,
  restaurantId,
}) => {
  const { t } = useTranslation();
  const { data: optionDict } = useStore((state) => state.optionDict);
  const options = optionDict?.options || {};
  const photo = dish?.photos[0];
  const { onOpen, onClose, isOpen } = useDisclosure();
  const trpcContext = trpc.useContext();
  const dishId = dish?.id || -1;

  const dishOptionQuery = trpc.option.getOptionFromDishId.useQuery(
    {
      dishId: dishId,
      restaurantId,
    },
    {
      enabled: isOpen && !options[dishId] && isEmpty(optionDict),
      staleTime: 60 * 1000,
    }
  );

  const option = options[dishId];
  const currentOption =
    (option && listifyOptions(option)) || dishOptionQuery.data;

  const showOption = () => {
    onOpen();
  };

  useEffect(() => {
    if (dishOptionQuery.isFetching && option) {
      trpcContext.option.getOptionFromDishId.cancel();
    }
  }, [
    dishOptionQuery.isFetching,
    option,
    trpcContext.option.getOptionFromDishId,
  ]);
  if (!dish) {
    return null;
  }
  return (
    <>
      <Card
        width="full"
        variant="outline"
        direction={["column", "column", "row"]}
        alignItems={["center", "center", "flex-start"]}
        justifyContent={["center", "center", "flex-start"]}
      >
        <Box maxH="40" maxW="40">
          {photo && (
            <Img
              boxSize="40"
              src={photo.value}
              alt={dish.name}
              style={{ objectFit: "scale-down" }}
              p={4}
              borderRadius="md"
            />
          )}
        </Box>

        <CardBody>
          <Stack
            alignItems={["center", "center", "flex-start"]}
            justifyContent={["center", "center", "flex-start"]}
            direction={["column", "column", "row"]}
          >
            <Box flex={1}>
              <Button variant="link" onClick={showOption}>
                <Text fontWeight="semibold" fontSize={["md", "md", "lg"]}>
                  {dish.name}
                </Text>
              </Button>
              <Text fontSize="sm">{dish.description}</Text>
            </Box>
            <VStack alignItems="flex-start" justifyContent="flex-start">
              {isEmpty(dish.discountPrice) ? (
                <Text>
                  {t("common.price_number", { val: dish.price?.value })}
                </Text>
              ) : (
                <Text as="s">
                  {t("common.price_number", { val: dish.price?.value })}
                </Text>
              )}
              {!isEmpty(dish.discountPrice) && (
                <Text textColor="blue.400" fontWeight="bold">
                  {t("common.price_number", { val: dish.discountPrice?.value })}
                </Text>
              )}
            </VStack>
          </Stack>
        </CardBody>
      </Card>

      <ItemOptionModal
        isOpen={isOpen}
        onClose={onClose}
        dish={dish}
        options={currentOption}
        isFetching={dishOptionQuery.isFetching}
      />
    </>
  );
};

export default RestaurantMenuItem;

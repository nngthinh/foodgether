import { useRouter } from "next/router";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { prisma } from "../../server/db/client";
import { SharedPropsFromServer } from "../../types/shared";
import { convertObjectWithDates } from "../../utils/date";
import { AggregatedRestaurantWithStringDate } from "../../types/restaurant";
import { useEffect } from "react";

export async function getStaticPaths() {
  const idObjectList =
    (await prisma.restaurant.findMany({
      select: { id: true },
    })) || [];

  return {
    paths: idObjectList.map(({ id }) => ({ params: { id: id.toString() } })),
    fallback: true,
  };
}

type GetRestaurantServerParams = SharedPropsFromServer & {
  params: {
    id: string;
  };
};

export const getStaticProps = async ({
  locale,
  params: { id },
}: GetRestaurantServerParams) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      dishTypes: {
        include: {
          dishes: true,
        },
      },
    },
  });
  return {
    props: {
      restaurant: convertObjectWithDates(
        restaurant
      ) as AggregatedRestaurantWithStringDate,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

type RestaurantPageProps = {
  restaurant: AggregatedRestaurantWithStringDate;
};

const RestaurantPage = ({ restaurant }: RestaurantPageProps) => {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {}, []);

  return <>{id}</>;
};

export default RestaurantPage;

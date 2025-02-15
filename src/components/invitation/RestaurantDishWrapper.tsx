import { Box, Skeleton } from "@chakra-ui/react";
import { get } from "radash";
import { FunctionComponent } from "react";
import useStore from "../../hooks/store";
import { InvitationDishWithPriceAndPhoto } from "../../types/dish";
import RestaurantMenuItem from "./RestaurantMenuItem";

type RestaurantDishWrapperProps = {
  dishId: number;
  restaurantId: number;
};

const RestaurantDishWrapper: FunctionComponent<RestaurantDishWrapperProps> = ({
  dishId,
  restaurantId,
}) => {
  const { dishDict } = useStore((state) => ({
    dishDict: state.dishDict.dataV2.invitationPage,
  }));
  const dish = get(dishDict, `dishes.${dishId}`);
  return (
    <Box width="100%" marginY="2">
      <Skeleton isLoaded={!!dish} height="40" fadeDuration={4}>
        <RestaurantMenuItem
          dish={dish as InvitationDishWithPriceAndPhoto}
          restaurantId={restaurantId}
        />
      </Skeleton>
    </Box>
  );
};

export default RestaurantDishWrapper;

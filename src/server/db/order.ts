import { PrismaClient } from "@prisma/client";
import { CreateOrderParams } from "../schemas/order";
import { prisma } from "./client";

export const updateOrder = async (order: CreateOrderParams, userId: string) => {
  await prisma.order.delete({
    where: {
      orderedById_invitationRestaurantId_invitationId: {
        orderedById: userId,
        invitationRestaurantId: order.restaurantId,
        invitationId: order.invitationId,
      },
    },
  });
  return createOrder(order, userId);
};

export const createOrder = (order: CreateOrderParams, userId: string) => {
  return prisma.order.create({
    data: {
      invitation: {
        connect: {
          id: order.invitationId,
        },
      },
      orderedBy: {
        connect: {
          id: userId,
        },
      },
      orderDishes: {
        create: order.items.map((item) => ({
          id: item.id,
          invitationDish: {
            connect: {
              id_invitationRestaurantId: {
                id: item.dishId,
                invitationRestaurantId: order.restaurantId,
              },
            },
          },
          invitationRestaurant: {
            connect: {
              id: order.restaurantId,
            },
          },
          orderDishOptions: {
            create: item.options.map((option) => ({
              id: option.id,
              invitationOption: {
                connect: {
                  id_invitationRestaurantId: {
                    id: option.optionId,
                    invitationRestaurantId: order.restaurantId,
                  },
                },
              },
              invitationRestaurant: {
                connect: {
                  id: order.restaurantId,
                },
              },
              orderDishOptionItems: {
                create: option.mandatory
                  ? {
                      optionItemId: option.value.optionItemId,
                      dishId: item.dishId,
                      restaurantId: order.restaurantId,
                      price: option.value.price,
                      id: option.value.id,
                      invitationOptionItem: {
                        connect: {
                          id_dishId_invitationRestaurantId: {
                            id: option.value.optionItemId,
                            dishId: item.dishId,
                            invitationRestaurantId: order.restaurantId,
                          },
                        },
                      },
                    }
                  : option.value.map((optionItem) => ({
                      invitationOptionItem: {
                        connect: {
                          id_dishId_invitationRestaurantId: {
                            id: optionItem.optionItemId,
                            dishId: item.dishId,
                            invitationRestaurantId: order.restaurantId,
                          },
                        },
                      },
                      price: optionItem.price,
                      id: optionItem.id,
                    })),
              },
              price: option.price,
            })),
          },
          dishPrice: item.dishPrice,
          totalPrice: item.totalPrice,
        })),
      },
      invitationRestaurant: {
        connect: {
          id: order.restaurantId,
        },
      },
    },
  });
};

export const getExistingOrder = async (
  prisma: PrismaClient,
  invitationId: string,
  restaurantId: number,
  userId: string
) => {
  return prisma.order.findUnique({
    where: {
      orderedById_invitationRestaurantId_invitationId: {
        orderedById: userId,
        invitationRestaurantId: restaurantId,
        invitationId,
      },
    },
    include: {
      orderDishes: {
        include: {
          orderDishOptions: {
            include: {
              orderDishOptionItems: true,
            },
          },
        },
      },
    },
  });
};

import {
  Box,
  Button,
  Heading,
  HStack,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import Image from "next/image";
import { FunctionComponent, useEffect } from "react";
import { Photo } from "../../types/shared";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { trpc } from "../../utils/trpc";
import { useRouter } from "next/router";

type RestaurantHeaderProps = {
  photo?: Photo;
  name: string;
  address: string;
  isAvailable: boolean;
  priceRange: {
    minPrice: number;
    maxPrice: number;
  };
  url: string;
  restaurantId: number;
};

const RestaurantHeader: FunctionComponent<RestaurantHeaderProps> = ({
  photo,
  name = "",
  address = "",
  isAvailable = false,
  priceRange,
  url = "",
  restaurantId = -1,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const createInvitationMutate =
    trpc.invitation.createNewInvitation.useMutation();

  useEffect(() => {
    if (!createInvitationMutate.data) return;
    router.push(`/invitation/${createInvitationMutate.data}`);
  }, [createInvitationMutate.data, router]);
  return (
    <Box
      maxH="fit-content"
      display="flex"
      flexDirection={["column", "column", "row"]}
      gap={10}
      padding={4}
      width="100%"
    >
      <Box maxH={["100%", "2xs", "3xs"]} maxW={["100%", "2xs", "md"]}>
        {photo ? (
          <Image
            src={photo.value}
            height={photo.height}
            width={photo.width}
            alt={t("invitation_page.cover_photo", {
              name: name,
            })}
            style={{
              objectFit: "scale-down",
            }}
            priority={true}
          />
        ) : (
          <Skeleton height="200px" width="96" />
        )}
      </Box>

      <VStack flex={1} alignItems="flex-start">
        <Heading size={["md", "md", "lg"]}>
          {name ? (
            <Link href={url} target="_blank">
              <Box alignItems="center" justifyContent="center">
                {name} <ExternalLinkIcon pb={1} />
              </Box>
            </Link>
          ) : (
            <Skeleton height="6" width="80" />
          )}
        </Heading>

        <Text>{address}</Text>
        <HStack justifyContent="center" alignItems="center">
          <Image
            src={isAvailable ? "/open.svg" : "/closed.svg"}
            width={30}
            height={30}
            alt={
              isAvailable
                ? t("invitation_page.is_open")
                : t("invitation_page.is_closed")
            }
          />
          <Text textColor={isAvailable ? "green" : "red"}>
            {isAvailable
              ? t("invitation_page.is_open")
              : t("invitation_page.is_closed")}
          </Text>
        </HStack>
        {priceRange ? (
          <HStack>
            <Image src="/price.svg" width={24} height={24} alt="" />
            <Text>
              {t("common.price_number", { val: priceRange.minPrice })} -{" "}
              {t("common.price_number", { val: priceRange.maxPrice })}
            </Text>
          </HStack>
        ) : (
          <Skeleton height="6" width="64" />
        )}
        <Button
          onClick={() => {
            createInvitationMutate.mutate({
              restaurantId,
            });
          }}
          disabled={restaurantId === -1}
        >
          {t("restaurant_page.create_invitation")}
        </Button>
      </VStack>
    </Box>
  );
};

export default RestaurantHeader;

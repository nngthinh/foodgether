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
import { FunctionComponent } from "react";
import { Photo } from "../../types/shared";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { ExternalLinkIcon } from "@chakra-ui/icons";

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
  invitationId: string;
};

const RestaurantHeader: FunctionComponent<RestaurantHeaderProps> = ({
  photo,
  name = "",
  address = "",
  isAvailable = false,
  priceRange,
  url = "",
}) => {
  const { t } = useTranslation();

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
            alt={t("invitation_manage_page.cover_photo", {
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
                ? t("invitation_manage_page.is_open")
                : t("invitation_manage_page.is_closed")
            }
          />
          <Text textColor={isAvailable ? "green" : "red"}>
            {isAvailable
              ? t("invitation_manage_page.is_open")
              : t("invitation_manage_page.is_closed")}
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
        <HStack>
          <Button variant="ghost" colorScheme="blue">
            {t("invitation_manage_page.confirm_group_buy")}
          </Button>
          <Button variant="link" colorScheme="red">
            {t("invitation_manage_page.cancel_group_buy")}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default RestaurantHeader;

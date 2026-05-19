import honorImage from "@assets/generated_images/honor_magic6_pro_green.png";
import watchImage from "@assets/generated_images/garmin_venu_3s_watch.png";
import adapterImage from "@assets/generated_images/vlp_20w_adapter.png";
import caseImage from "@assets/generated_images/transparent_phone_case.png";
import glassImage from "@assets/generated_images/screen_protector.png";
import budsImage from "@assets/generated_images/wireless_earbuds.png";

const imageMap: Record<string, string> = {
  honor_magic6_pro_green: honorImage,
  garmin_venu_3s_watch: watchImage,
  vlp_20w_adapter: adapterImage,
  transparent_phone_case: caseImage,
  screen_protector: glassImage,
  wireless_earbuds: budsImage,
};

export function getProductImage(imageKey: string): string {
  return imageMap[imageKey] || honorImage;
}

export { honorImage, watchImage, adapterImage, caseImage, glassImage, budsImage };

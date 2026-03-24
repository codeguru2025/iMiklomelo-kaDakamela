const assetUrl = (fileName: string) => `/api/assets/${encodeURIComponent(fileName)}`;

export const assets = {
  logo: assetUrl("DK_LOGO_1769944557082.png"),
  chibikhululogo: assetUrl("CK_Logo_1770117291903.jpeg"),
  kingdomBlueLogo: assetUrl("kbf_logo_1770113825582.png"),
  campPlan: assetUrl("Chief_Dakamela_Awards_Camping_Plan_1769945860736.png"),
  eventImage1: assetUrl("IMG_0740_1770114288425.jpg"),
  eventImage2: assetUrl("IMG_0739_1770114288425.jpg"),
  eventImage3: assetUrl("IMG_0738_1770114288426.jpg"),
  eventImage4: assetUrl("IMG_0732_1770114288426.jpg"),
  awardCeremony1: assetUrl("IMG_0730_1770114288427.jpg"),
  awardCeremony2: assetUrl("IMG_0729_1770114288428.jpg"),
  awardCeremony3: assetUrl("IMG_0728_1770114288428.jpg"),
  pastEvent1: assetUrl("IMG_0731_1770114288427.jpg"),
  pastEvent2: assetUrl("IMG_0727_1770114288428.jpg"),
  pastEvent3: assetUrl("IMG_0725_(1)_1770114288429.jpg"),
};

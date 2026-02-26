export interface ColorVariable {
  name: string;
  value: string;
  reference?: string;
}

export interface ColorCollection {
  name: string;
  baseColor: string;
  baseValue: string;
  variables: ColorVariable[];
}

// Sample data matching the Figma design
export const colorCollections: ColorCollection[] = [
  {
    name: "Cerulean",
    baseColor: "$cerulean",
    baseValue: "#4183CA",
    variables: [
      { name: "$cerulean-100", value: "#ECF3FA", reference: "cerulean / 100" },
      { name: "$cerulean-200", value: "#C6DAEF", reference: "cerulean / 200" },
      { name: "$cerulean-300", value: "#A0C1E4", reference: "cerulean / 300" },
      { name: "$cerulean-400", value: "#85A7DA" },
      { name: "$cerulean-500", value: "#588DCF", reference: "cerulean / 500" },
      { name: "$cerulean-600", value: "#3B72AF", reference: "cerulean / 600" },
      { name: "$cerulean-700", value: "#356194" },
      { name: "$cerulean-800", value: "#2E4E75", reference: "cerulean / 800" },
      { name: "$cerulean-900", value: "#0D1A28", reference: "cerulean / 900" },
    ],
  },
  {
    name: "Indigo",
    baseColor: "$indigo",
    baseValue: "#6610F2",
    variables: [
      { name: "$indigo-100", value: "#E0CFFC", reference: "indigo / 100" },
      { name: "$indigo-200", value: "#C29FFA", reference: "indigo / 200" },
      { name: "$indigo-300", value: "#A370F7" },
      { name: "$indigo-400", value: "#8540F5", reference: "indigo / 400" },
      { name: "$indigo-500", value: "#6610F2", reference: "indigo / 500" },
      { name: "$indigo-600", value: "#520DC2" },
      { name: "$indigo-700", value: "#3D0A91", reference: "indigo / 700" },
      { name: "$indigo-800", value: "#290661", reference: "indigo / 800" },
      { name: "$indigo-900", value: "#140330", reference: "indigo / 900" },
    ],
  },
  {
    name: "Purple",
    baseColor: "$purple",
    baseValue: "#6F42C1",
    variables: [
      { name: "$purple-100", value: "#E2D9F3", reference: "purple / 100" },
      { name: "$purple-200", value: "#C5B3E6" },
      { name: "$purple-300", value: "#A98EDA", reference: "purple / 300" },
      { name: "$purple-400", value: "#8C68CD" },
      { name: "$purple-500", value: "#6F42C1", reference: "purple / 500" },
      { name: "$purple-600", value: "#59359A", reference: "purple / 600" },
      { name: "$purple-700", value: "#432874" },
      { name: "$purple-800", value: "#2C1A4D", reference: "purple / 800" },
      { name: "$purple-900", value: "#160D27", reference: "purple / 900" },
    ],
  },
  {
    name: "Success",
    baseColor: "$green",
    baseValue: "#198754",
    variables: [
      { name: "$green-100", value: "#D1E7DD", reference: "green / 100" },
      { name: "$green-200", value: "#A3CFBB", reference: "green / 200" },
      { name: "$green-300", value: "#75B798" },
      { name: "$green-400", value: "#479F76", reference: "green / 400" },
      { name: "$green-500", value: "#198754", reference: "success" },
      { name: "$green-600", value: "#146C43", reference: "green / 600" },
      { name: "$green-700", value: "#0F5132" },
      { name: "$green-800", value: "#0A3622", reference: "green / 800" },
      { name: "$green-900", value: "#051B11", reference: "green / 900" },
    ],
  },
  {
    name: "Danger",
    baseColor: "$red",
    baseValue: "#DC3545",
    variables: [
      { name: "$red-100", value: "#F8D7DA", reference: "red / 100" },
      { name: "$red-200", value: "#F1AEB5", reference: "red / 200" },
      { name: "$red-300", value: "#EA868F" },
      { name: "$red-400", value: "#E35D6A", reference: "red / 400" },
      { name: "$red-500", value: "#DC3545", reference: "danger" },
      { name: "$red-600", value: "#B02A37", reference: "red / 600" },
      { name: "$red-700", value: "#842029" },
      { name: "$red-800", value: "#58151C", reference: "red / 800" },
      { name: "$red-900", value: "#2C0B0E", reference: "red / 900" },
    ],
  },
  {
    name: "Warning",
    baseColor: "$yellow",
    baseValue: "#FFC107",
    variables: [
      { name: "$yellow-100", value: "#FFF3CD", reference: "yellow / 100" },
      { name: "$yellow-200", value: "#FFE69C", reference: "yellow / 200" },
      { name: "$yellow-300", value: "#FFDA6A" },
      { name: "$yellow-400", value: "#FFCD39", reference: "yellow / 400" },
      { name: "$yellow-500", value: "#FFC107", reference: "warning" },
      { name: "$yellow-600", value: "#CC9A06", reference: "yellow / 600" },
      { name: "$yellow-700", value: "#997404" },
      { name: "$yellow-800", value: "#664D03", reference: "yellow / 800" },
      { name: "$yellow-900", value: "#332701", reference: "yellow / 900" },
    ],
  },
];

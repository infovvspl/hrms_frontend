export const getCompanyLogo = (company = {}) =>
  company.logo ||
  company.logo_url ||
  company.company_logo ||
  company.profile_pic ||
  company.profilePic ||
  "";

export const getCompanyLogoSrc = (company = {}) => {
  const logo = getCompanyLogo(company);

  if (!logo || typeof logo !== "string") return "";
  if (logo.startsWith("blob:") || logo.startsWith("data:") || /^https?:\/\//i.test(logo)) {
    return logo;
  }

  const serverAddress = import.meta.env.VITE_SERVER_ADDRESS;
  if (!serverAddress) return logo;

  return `${serverAddress.replace(/\/$/, "")}/${logo.replace(/^\//, "")}`;
};

export const getCompanyInitial = (company = {}) =>
  (company.company_name || company.name || "H").charAt(0).toUpperCase();

export const getEmployeeAvatarSrc = (imagePath) => {
  if (!imagePath || typeof imagePath !== "string") return "";
  if (imagePath.startsWith("blob:") || imagePath.startsWith("data:") || /^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }
  const serverAddress = import.meta.env.VITE_SERVER_ADDRESS;
  if (!serverAddress) return imagePath;
  return `${serverAddress.replace(/\/$/, "")}/${imagePath.replace(/^\//, "")}`;
};

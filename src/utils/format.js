export function getCompanyAbbreviation(name) {
  if (!name) return "EMP";
  // Filter out legal designations
  const cleanName = name.replace(/\b(pvt|ltd|llp|inc|co|corp|corporation|pvt\.?|ltd\.?)\b/gi, '').trim();
  const uppers = cleanName.match(/[A-Z]/g);
  if (uppers && uppers.length >= 2) {
    return uppers.join("").substring(0, 4).toUpperCase();
  }
  // Fallback to first 3 letters
  return cleanName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase() || "EMP";
}

export function formatEmployeeId(companyName, companyEmployeeId, userId) {
  const prefix = getCompanyAbbreviation(companyName);
  const idNum = companyEmployeeId || userId || 1;
  const paddedId = String(idNum).padStart(4, "0");
  return `${prefix}-${paddedId}`;
}

// Who runs the site, for the legal notice (LSSI art. 10) and the privacy
// policy (GDPR art. 13). Fill in the three fields to show them; while they're
// empty, the pages show only the contact email — never a blank or a placeholder.

export const TITULAR = {
  nombre: "", // nombre y apellidos (o la razón social si un día hay empresa)
  nif: "", // DNI con letra (o CIF)
  domicilio: "", // calle, número, código postal y ciudad (puede ser una domiciliación)
};

export const CONTACT_EMAIL = "flayfind@gmail.com";
export const SITE_DOMAIN = "masterspread.com";
export const LEGAL_ACTUALIZADO = "22 de octubre de 2026";

export const hayTitular = () => !!(TITULAR.nombre && TITULAR.nif && TITULAR.domicilio);

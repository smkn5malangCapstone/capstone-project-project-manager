export const ProviderEnum = {
  GOOGLE: "google",
  FACEBOOK: "facebook",
  GITHUB: "github",
  EMAIL : "email",
}

export type ProviderEnumType = keyof typeof ProviderEnum;
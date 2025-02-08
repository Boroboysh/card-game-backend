export const AuthErrorCodes = {
  INVALID_CREDENTIALS: 1,
  TOKEN_REQUIRED: 2,
  ACCESS_DENIED: 3,
  USERNAME_TAKEN: 4,
  USER_NOT_FOUND: 5,
  TOKEN_INVALID: 6,
} as const;

export const CardErrorCodes = {
  NOT_FOUND: 100,
  ALREADY_EXISTS: 101,
} as const;

export const DeckErrorCodes = {
  LIMIT_REACHED: 200,
  NOT_FOUND: 201,
  CARD_NOT_FOUND: 202,
} as const;

export const GameErrorCodes = {
  INVALID_MATCHMAKING_DATA: 300
}
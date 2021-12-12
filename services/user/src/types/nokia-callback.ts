import { Static, Type } from '@sinclair/typebox'

export const Callback = Type.Object({userid: Type.String(), code: Type.String()});
export type CallbackType = Static<typeof Callback>;

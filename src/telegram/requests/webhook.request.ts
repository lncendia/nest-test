import {
  CallbackQuery,
  ChatJoinRequest,
  ChatMemberUpdated,
  ChosenInlineResult,
  InlineQuery,
  Message,
  Poll,
  PollAnswer,
  PreCheckoutQuery,
  ShippingQuery,
  Update,
} from 'node-telegram-bot-api';

export class WebhookRequest implements Update {
  update_id: number;
  message?: Message | undefined;
  edited_message?: Message | undefined;
  channel_post?: Message | undefined;
  edited_channel_post?: Message | undefined;
  inline_query?: InlineQuery | undefined;
  chosen_inline_result?: ChosenInlineResult | undefined;
  callback_query?: CallbackQuery | undefined;
  shipping_query?: ShippingQuery | undefined;
  pre_checkout_query?: PreCheckoutQuery | undefined;
  poll?: Poll | undefined;
  poll_answer?: PollAnswer | undefined;
  my_chat_member?: ChatMemberUpdated | undefined;
  chat_member?: ChatMemberUpdated | undefined;
  chat_join_request?: ChatJoinRequest | undefined;
}

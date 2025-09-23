import { Otp } from '../entities/auth/otp.entity';
import { User } from '../entities/user/user.entity';
import { Address } from '../entities/user/address.entity';

import { Transaction } from '../entities/wallet/transaction.entity';
import { Wallet } from '../entities/wallet/wallet.entity';
import { NotificationEntity } from '../entities/notification/notification.entity';

import { SuggestionsComplaints } from '../entities/suggestions-complaints/suggestions-complaints.entity';

import { StaticPage } from '../entities/static-pages/static-pages.entity';
import { ContactUs } from '../entities/contact-us/contact-us.entity';
import { City } from '../entities/city/city.entity';
import { Country } from '../entities/country/country.entity';

import { Banar } from '../entities/banar/banar.entity';

import { Chat } from '../entities/chat/chat.entity';
import { Message } from '../entities/chat/messages.entity';
import { Driver } from '../entities/driver/driver.entity';
import { TruckSize } from '../entities/truck/truck-size.entity';
import { TruckType } from '../entities/truck/truck-type.entity';
import { Order } from '../entities/order/order.entity';
import { PackageType } from '../entities/order/package-type.entity';
import { OfferStatus } from '../data/enums/order-status.enumt';
import { OrderOffer } from '../entities/order/order-offer.entity';
import { FaqCategory } from 'src/modules/faq/faq/faq-category';
import { FaqQuestion } from 'src/modules/faq/faq/faq_question';

export const DB_ENTITIES = [
  User,
  Address,
  Otp,
  Country,
  Transaction,
  Driver,
  Wallet,
  NotificationEntity,
  Banar,
  TruckSize,
  TruckType,
  Order,
  PackageType,
  OrderOffer,
  SuggestionsComplaints,
  FaqQuestion,
  StaticPage,
  ContactUs,
  City,
  Country,
  FaqCategory,

  Chat,
  Message,
];

export const DB_VIEWS = [];

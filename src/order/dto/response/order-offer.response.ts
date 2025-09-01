import { Expose, Type } from "class-transformer";
import { UserResponse } from "src/modules/user/dto/response/user-response";

export class OrderOfferResponse {
@Expose()
id: string;
@Expose()
price:number
@Expose()
status:string
@Expose()
@Type(() => UserResponse)
Driver:any
}
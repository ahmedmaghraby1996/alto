import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import { UserResponse } from "src/modules/user/dto/response/user-response";

export class OrderOfferResponse {
@Expose()
id: string;
@Expose()
price:number
@Expose()
status:string
@Expose()
@Transform((value) => {

    return plainToInstance(UserResponse, {...value.obj?.driver?.user,rating:0});
})
Driver:any
}
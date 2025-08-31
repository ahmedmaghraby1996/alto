import { Expose } from "class-transformer";

export class OrderListResponse {
@Expose()
id: string
@Expose()
created_at: Date
@Expose()
status: string
@Expose()
is_fragile: boolean
@Expose()
needs_freezing: boolean
@Expose()
needs_cooling: boolean
@Expose()
pickup_address: string
@Expose()
delivery_address: string
@Expose()
number: string
@Expose()
description: string


}
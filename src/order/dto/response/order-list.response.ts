import { Expose, plainToInstance, Transform, Type } from 'class-transformer';
import { off } from 'process';
import { UserResponse } from 'src/modules/user/dto/response/user-response';

export class OrderListResponse {
  @Expose()
  id: string;
  @Expose()
  created_at: Date;
  @Expose()
  status: string;
  @Expose()
  is_fragile: boolean;
  @Expose()
  needs_freezing: boolean;
    @Expose()
  @Type(() => UserResponse)
  user:UserResponse
  @Expose()
  needs_cooling: boolean;
  @Expose()
  pickup_address: string;
  @Expose()
  delivery_address: string;
    @Expose()
    pickup_latitude: number;
  
    @Expose()
    pickup_longitude: number;
    @Expose()
    delivery_latitude: number;
    @Expose()
    delivery_longitude: number;
  @Expose()
  number: string;
  @Expose()
  description: string;

  @Expose()
  @Transform(({ obj }) => {
    if (!obj?.driver?.user) return null;

    return {
      ...plainToInstance(UserResponse, obj.driver.user, { excludeExtraneousValues: true }),
      rating: obj.driver.total_rating / (obj.driver.number_of_ratings || 1),
      vehicle_type: obj.driver.vehicle_type,
      vehicle_number: obj.driver.vehicle_registration_number,
      latitude: obj.driver.latitude,
      longitude: obj.driver.longitude,
    };
  })
  driver: UserResponse;

  @Expose()
  @Transform((value) => {
    return plainToInstance(UserResponse, value.obj?.offers?.length);
  })
  offers_count: number;

  @Expose()
  trucks_count: number;
}

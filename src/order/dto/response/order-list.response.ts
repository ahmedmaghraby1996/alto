import { Expose, plainToInstance, Transform } from 'class-transformer';
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
  needs_cooling: boolean;
  @Expose()
  pickup_address: string;
  @Expose()
  delivery_address: string;
  @Expose()
  number: string;
  @Expose()
  description: string;

  @Expose()
  @Transform((value) => {
    if (value.obj?.driver?.user == null) return null;
    return plainToInstance(
      UserResponse,
      {
        ...value.obj?.driver?.user,
        rating: 0,
        vehicle_type: value.obj?.driver?.vehicle_type,
        vehicle_number: value.obj?.driver?.vehicle_registration_number,
        latitude: value.obj?.driver?.latitude,
        longitude: value.obj?.driver?.longitude,
      },
      { excludeExtraneousValues: true },
    );
  })
  driver: UserResponse;

  @Expose()
  @Transform((value) => {
    return plainToInstance(UserResponse, value.obj?.offers?.length);
  })
  offers_count: number;
}

export abstract class Gateways {
  /**
   * Driver gateway
   * @static
   * @memberof Gateways
   * @example update-location
   * @example driver
   */
  static Driver = class {
    /** driver */
    static Namespace = 'driver';
    /** update-location */
    static UpdateLocation = 'update-location';
    /** driver-offer */
    static DriverOffer = 'driver-offer';
  }

  /**
   * Order gateway
   * @static
   * @memberof Gateways
   * @example order
   * @example order-offer
   */
  static chat = class {
 
    static Namespace = 'chat';
   

   
  }

  static ph_order = class {
 
    static Namespace = 'ph-order';
   

   
  }

  static order = class {
 
    static Namespace = 'order';

    static OrderOffer = 'offer';
   

   
  }
}

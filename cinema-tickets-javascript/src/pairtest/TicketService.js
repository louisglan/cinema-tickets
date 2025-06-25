import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';

export default class TicketService {
  #ticketPaymentService = new TicketPaymentService()
  #seatReservationService = new SeatReservationService()
  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {
    this.#ticketPaymentService.makePayment(accountId, this.#getCostFromTicketType(ticketTypeRequests[0].getTicketType()))
    this.#seatReservationService.reserveSeat(accountId, ticketTypeRequests[0].getNoOfTickets())
  }

  #getCostFromTicketType(ticketType) {
    const costs = {
      'ADULT': 25,
      'CHILD': 15,
      'INFANT': 0
    }
    return costs[ticketType]
  }
}

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
    this.#validateTicketCount(ticketTypeRequests)
    this.#validateAdultIsPresent(ticketTypeRequests)
    const totalCost = this.#sumTicketRequests(ticketTypeRequests)
    const totalSeats = this.#sumSeats(ticketTypeRequests)
    this.#ticketPaymentService.makePayment(accountId, totalCost)
    this.#seatReservationService.reserveSeat(accountId, totalSeats)
  }

  #validateTicketCount(ticketRequests) {
    const ticketSum = ticketRequests.reduce((acc, ticketRequest) => {
      return acc + ticketRequest.getNoOfTickets()
    }, 0)
    if (ticketSum > 25) throw new InvalidPurchaseException("Cannot purchase more than 25 tickets")
  }

  #validateAdultIsPresent(ticketRequests) {
    if (ticketRequests.filter(ticketRequest => ticketRequest.getTicketType() == 'ADULT').length === 0) {
      throw new InvalidPurchaseException("At least one adult ticket must be purchased")
    }
  }

  #sumTicketRequests(ticketRequests) {
    return ticketRequests.reduce((acc, ticketRequest) => {
        const ticketTypeCount = ticketRequest.getNoOfTickets()
        const ticketTypeCost = this.#getCostFromTicketType(ticketRequest.getTicketType())
        return acc + ticketTypeCount * ticketTypeCost
      }, 0)
  }

  #sumSeats(ticketRequests) {
    return ticketRequests.reduce((acc, ticketRequest) => {
      if (ticketRequest.getTicketType() === 'INFANT') return acc
      return acc + ticketRequest.getNoOfTickets()
    }, 0)
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

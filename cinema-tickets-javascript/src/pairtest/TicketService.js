import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';
import TicketRequestValidator from './TicketRequestValidator.js';

export default class TicketService {
  #ticketPaymentService = new TicketPaymentService()
  #seatReservationService = new SeatReservationService()

/*
Assumptions:
Only one ticket type request can be made per purchase
One adult can only seat one child on their lap
Cinema is infinitely big
There will always be at least one ticketTypeRequest
*/
  purchaseTickets(accountId, ...ticketTypeRequests) {
    TicketRequestValidator.validateTicketRequests(ticketTypeRequests)
    this.#validateAccountId(accountId)
    const totalCost = this.#sumTicketRequests(ticketTypeRequests)
    const totalSeats = this.#sumSeats(ticketTypeRequests)
    this.#ticketPaymentService.makePayment(accountId, totalCost)
    this.#seatReservationService.reserveSeat(accountId, totalSeats)
  }

  #validateAccountId(accountId) {
    if (accountId <= 0) throw new InvalidPurchaseException("Account ID must be greater than zero")
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
      if (ticketRequest.getTicketType() == 'INFANT') return acc
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

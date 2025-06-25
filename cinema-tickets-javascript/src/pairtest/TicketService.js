import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';

export default class TicketService {
  #ticketPaymentService = new TicketPaymentService()
  #seatReservationService = new SeatReservationService()

/*
Assumptions:
Only one ticket type request can be made per purchase
One adult can only seat one child on their lap
*/
  purchaseTickets(accountId, ...ticketTypeRequests) {
    this.#validateTicketRequests(ticketTypeRequests)
    this.#validateAccountId(accountId)
    const totalCost = this.#sumTicketRequests(ticketTypeRequests)
    const totalSeats = this.#sumSeats(ticketTypeRequests)
    this.#ticketPaymentService.makePayment(accountId, totalCost)
    this.#seatReservationService.reserveSeat(accountId, totalSeats)
  }

  #validateTicketRequests(ticketRequests) {
    this.#validateTicketCount(ticketRequests)
    this.#validateAdultIsPresent(ticketRequests)
    this.#validateInfantsDoNotExceedAdults(ticketRequests)
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

  #validateInfantsDoNotExceedAdults(ticketRequests) {
    const infantTickets = ticketRequests.filter(ticketRequest => ticketRequest.getTicketType() == 'INFANT')
    const adultTickets = ticketRequests.filter(ticketRequest => ticketRequest.getTicketType() == 'ADULT')
    const infantTicketCount = this.#getTicketCountFromSingleTicketType(infantTickets)
    const adultTicketCount = this.#getTicketCountFromSingleTicketType(adultTickets)
    if (infantTicketCount > adultTicketCount) throw new InvalidPurchaseException("There should be at least one adult per infant. An adult should not have two or more infants on their lap")
  }

  #getTicketCountFromSingleTicketType(tickets) {
    let ticketCount
    if (tickets.length == 0) {
      ticketCount = 0
    } else {
      ticketCount = tickets[0].getNoOfTickets()
    }
    return ticketCount
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

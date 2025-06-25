import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';

export default class TicketService {
  #ADULT = 'ADULT'
  #INFANT = 'INFANT'

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
    const hasAdultTickets = ticketRequests.filter(ticketRequest => this.#isAdult(ticketRequest)).length > 0
    if (!hasAdultTickets) {
      throw new InvalidPurchaseException("At least one adult ticket must be purchased")
    }
  }

  #isAdult(ticketRequest) {
    return ticketRequest.getTicketType() == this.#ADULT
  }

  #isInfant(ticketRequest) {
    return ticketRequest.getTicketType() == this.#INFANT
  }

  #validateInfantsDoNotExceedAdults(ticketRequests) {
    const infantTickets = ticketRequests.filter(ticketRequest => this.#isInfant(ticketRequest))
    const adultTickets = ticketRequests.filter(ticketRequest => this.#isAdult(ticketRequest))
    const infantTicketCount = this.#getTicketCountFromSingleTicketType(infantTickets)
    const adultTicketCount = this.#getTicketCountFromSingleTicketType(adultTickets)
    if (infantTicketCount > adultTicketCount) throw new InvalidPurchaseException("There should be at least one adult per infant. An adult should not have two or more infants on their lap")
  }

  #getTicketCountFromSingleTicketType(tickets) {
    return tickets.length == 0 ? 0 : tickets[0].getNoOfTickets()
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
      if (this.#isInfant(ticketRequest)) return acc
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

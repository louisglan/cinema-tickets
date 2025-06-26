import InvalidPurchaseException from './lib/InvalidPurchaseException.js';

export default class TicketRequestValidator {
  static #ADULT = "ADULT";
  static #INFANT = "INFANT";

  static validateTicketRequests(ticketRequests) {
    this.#validateTicketCount(ticketRequests);
    this.#validateAdultIsPresent(ticketRequests);
    this.#validateInfantsDoNotExceedAdults(ticketRequests);
  }

  static #validateTicketCount(ticketRequests) {
    const ticketSum = ticketRequests.reduce((acc, ticketRequest) => {
      return acc + ticketRequest.getNoOfTickets();
    }, 0);
    if (ticketSum > 25)
      throw new InvalidPurchaseException(
        "Cannot purchase more than 25 tickets"
      );
  }

  static #validateAdultIsPresent(ticketRequests) {
    const hasAdultTickets =
      ticketRequests.filter((ticketRequest) => this.#isAdult(ticketRequest))
        .length > 0;
    if (!hasAdultTickets) {
      throw new InvalidPurchaseException(
        "At least one adult ticket must be purchased"
      );
    }
  }

  static #isAdult(ticketRequest) {
    return ticketRequest.getTicketType() == this.#ADULT;
  }

  static #isInfant(ticketRequest) {
    return ticketRequest.getTicketType() == this.#INFANT;
  }

  static #validateInfantsDoNotExceedAdults(ticketRequests) {
    const infantTickets = ticketRequests.filter((ticketRequest) =>
      this.#isInfant(ticketRequest)
    );
    const adultTickets = ticketRequests.filter((ticketRequest) =>
      this.#isAdult(ticketRequest)
    );
    const infantTicketCount =
      this.#getTicketCountFromSingleTicketType(infantTickets);
    const adultTicketCount =
      this.#getTicketCountFromSingleTicketType(adultTickets);
    if (infantTicketCount > adultTicketCount)
      throw new InvalidPurchaseException(
        "There should be at least one adult per infant. An adult should not have two or more infants on their lap"
      );
  }

  static #getTicketCountFromSingleTicketType(tickets) {
    return tickets.length == 0 ? 0 : tickets[0].getNoOfTickets();
  }
}

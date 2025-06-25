import InvalidPurchaseException from "../src/pairtest/lib/InvalidPurchaseException";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest";
import TicketService from "../src/pairtest/TicketService"
import TicketPaymentService from "../src/thirdparty/paymentgateway/TicketPaymentService"
import SeatReservationService from "../src/thirdparty/seatbooking/SeatReservationService";

const ADULT = 'ADULT'
const CHILD = 'CHILD'
const INFANT = 'INFANT'
const ACCOUNT_ID = 999999
let ticketService;

jest.mock("../src/thirdparty/paymentgateway/TicketPaymentService")
jest.mock("../src/thirdparty/seatbooking/SeatReservationService")

beforeEach(() => {
    jest.clearAllMocks()
    ticketService = new TicketService;
})

test("One adult ticket makes payment of £25 and reserves one seat", () => {
    const adultTicketRequest = new TicketTypeRequest(ADULT, 1)
    ticketService.purchaseTickets(ACCOUNT_ID, adultTicketRequest)
    expect(mockMakePaymentMethod()).toHaveBeenCalledWith(ACCOUNT_ID, 25)
    expect(mockReserveSeatMethod()).toHaveBeenCalledWith(ACCOUNT_ID, 1)
})

test("Two adult tickets makes payment of £50 and reserves two seats", () => {
    const adultTicketRequest = new TicketTypeRequest(ADULT, 2)
    ticketService.purchaseTickets(ACCOUNT_ID, adultTicketRequest)
    expect(mockMakePaymentMethod()).toHaveBeenCalledWith(ACCOUNT_ID, 50)
    expect(mockReserveSeatMethod()).toHaveBeenCalledWith(ACCOUNT_ID, 2)
})

test("One adult and one child ticket makes payment of £40 and reserves two seats", () => {
    const adultTicketRequest = new TicketTypeRequest(ADULT, 1)
    const childTicketRequest = new TicketTypeRequest(CHILD, 1)
    ticketService.purchaseTickets(ACCOUNT_ID, adultTicketRequest, childTicketRequest)
    expect(mockMakePaymentMethod()).toHaveBeenCalledWith(ACCOUNT_ID, 40)
    expect(mockReserveSeatMethod()).toHaveBeenCalledWith(ACCOUNT_ID, 2)
})

test("One adult and one infant ticket makes payment of £30 and reserves one seat", () => {
    const adultTicketRequest = new TicketTypeRequest(ADULT, 1)
    const infantTicketRequest = new TicketTypeRequest(INFANT, 1)
    ticketService.purchaseTickets(ACCOUNT_ID, adultTicketRequest, infantTicketRequest)
    expect(mockMakePaymentMethod()).toHaveBeenCalledWith(ACCOUNT_ID, 25)
    expect(mockReserveSeatMethod()).toHaveBeenCalledWith(ACCOUNT_ID, 1)
})

test("One adult, two children and an infant makes payment of £55 and reserves three seats", () => {
    const adultTicketRequest = new TicketTypeRequest(ADULT, 1)
    const childTicketRequest = new TicketTypeRequest(CHILD, 2)
    const infantTicketRequest = new TicketTypeRequest(INFANT, 1)
    ticketService.purchaseTickets(ACCOUNT_ID, adultTicketRequest, childTicketRequest, infantTicketRequest)
    expect(mockMakePaymentMethod()).toHaveBeenCalledWith(ACCOUNT_ID, 55)
    expect(mockReserveSeatMethod()).toHaveBeenCalledWith(ACCOUNT_ID, 3)
})

test("25 tickets is does not throw exception", () => {
    const adultTicketRequest = new TicketTypeRequest(ADULT, 25)
    ticketService.purchaseTickets(ACCOUNT_ID, adultTicketRequest)
    expect(mockMakePaymentMethod()).toHaveBeenCalledTimes(1)
    expect(mockReserveSeatMethod()).toHaveBeenCalledTimes(1)
})

test("More than 25 tickets throws exception", () => {
    const adultTicketRequest = new TicketTypeRequest(ADULT, 26)
    expect(() => {
        try {
            ticketService.purchaseTickets(ACCOUNT_ID, adultTicketRequest)
        } catch (error) {
            expect(error.message).toEqual("Cannot purchase more than 25 tickets")
            throw error
        }
    }).toThrow(InvalidPurchaseException)
})

test("More than 25 tickets across multiple ticket types throws exception", () => {
    const adultTicketRequest = new TicketTypeRequest(ADULT, 25)
    const childTicketRequest = new TicketTypeRequest(CHILD, 1)
    expect(() => {
        try {
            ticketService.purchaseTickets(ACCOUNT_ID, adultTicketRequest, childTicketRequest)
        } catch (error) {
            expect(error.message).toEqual("Cannot purchase more than 25 tickets")
            throw error
        }
    }).toThrow(InvalidPurchaseException)
})

test("Child tickets cannot be purchased on their own", () => {
    const childTicketRequest = new TicketTypeRequest(CHILD, 1)
    expect(() => {
        try {
            ticketService.purchaseTickets(ACCOUNT_ID, childTicketRequest)
        } catch (error) {
            expect(error.message).toEqual("At least one adult ticket must be purchased")
            throw error
        }
    }).toThrow(InvalidPurchaseException)
})

test("Infant tickets cannot be purchased on their own", () => {
    const infantTicketRequest = new TicketTypeRequest(INFANT, 1)
    expect(() => {
        try {
            ticketService.purchaseTickets(ACCOUNT_ID, infantTicketRequest)
        } catch (error) {
            expect(error.message).toEqual("At least one adult ticket must be purchased")
            throw error
        }
    }).toThrow(InvalidPurchaseException)
})

function mockMakePaymentMethod() {
    const mockTicketPaymentServiceInstance = TicketPaymentService.mock.instances[0];
    return mockTicketPaymentServiceInstance.makePayment;
}

function mockReserveSeatMethod() {
    const mockSeatReservationServiceInstance = SeatReservationService.mock.instances[0];
    return mockSeatReservationServiceInstance.reserveSeat;
}
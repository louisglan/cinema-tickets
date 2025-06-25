import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest";
import TicketService from "../src/pairtest/TicketService"
import TicketPaymentService from "../src/thirdparty/paymentgateway/TicketPaymentService"
import SeatReservationService from "../src/thirdparty/seatbooking/SeatReservationService";

const ticketService = new TicketService;
const ADULT = 'ADULT'
const CHILD = 'CHILD'
const INFANT = 'INFANT'
const ACCOUNT_ID = 999999
jest.mock("../src/thirdparty/paymentgateway/TicketPaymentService")
jest.mock("../src/thirdparty/seatbooking/SeatReservationService")

test("One adult ticket makes payment of £25 and Reserves one Seat", () => {
    const adultTicketRequest = new TicketTypeRequest(ADULT, 1)
    ticketService.purchaseTickets(ACCOUNT_ID, adultTicketRequest)
    const mockMakePayment = mockMakePaymentMethod()
    const mockReserveSeat = mockReserveSeatMethod()
    expect(mockMakePayment).toHaveBeenCalledWith(ACCOUNT_ID, 25)
    expect(mockReserveSeat).toHaveBeenCalledWith(ACCOUNT_ID, 1)
})

function mockMakePaymentMethod() {
    const mockTicketPaymentServiceInstance = TicketPaymentService.mock.instances[0];
    return mockTicketPaymentServiceInstance.makePayment;
}

function mockReserveSeatMethod() {
    const mockSeatReservationServiceInstance = SeatReservationService.mock.instances[0];
    return mockSeatReservationServiceInstance.reserveSeat;
}
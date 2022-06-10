import { middlewares } from '@alayacare/qa-automation-lib';

const {
  acc: {
    STANDARD_CLIENTS,
    createSchedulingMiddleware,
    readClientServicesMiddleware,
    readPatientsMiddleware,
  },
} = middlewares;
const client = STANDARD_CLIENTS;

export const createVacantVisit = async () => {
  const currentDate = Cypress.dayjs();
  const [patients] = await useMiddlewares([readPatientsMiddleware()]);
  const patientId = patients.data.items.find(
    // eslint-disable-next-line camelcase
    ({ full_name }) => full_name === client.navigational
  ).id;
  const [clientServices] = await useMiddlewares([
    readClientServicesMiddleware({ clientId: patientId }),
  ]);

  const clientService = clientServices.items[0];

  const scheduleData = {
    endAt: currentDate.add(3, 'hour'),
    patientId,
    patientName: client.navigational,
    selectedServiceCodeId: `${clientService.service_code.name}`,
    serviceCodeId: `${clientService.service_code.id}`,
    serviceGuid: `${clientService.guid}`,
    serviceId: `${clientService.id}`,
    startAt: currentDate.add(2, 'hour'),
    employeeId: '2', // This is for vacant employee so this is hardcoded
    breakMinutes: 0,
    useDefaultDuration: '1',
  };

  const [visitCreated] = await useMiddlewares([createSchedulingMiddleware(scheduleData)]);
  return { ...visitCreated, startAt: scheduleData.startAt, endAt: scheduleData.endAt };
};

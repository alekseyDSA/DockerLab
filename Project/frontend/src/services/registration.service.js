// services/registration.service.js
import { ApiService } from './api.service';
import { CompanyService } from './company.service';

export class RegistrationService {
    /**
     * Основной метод для регистрации клиента
     * @param {Object} registrator - выбранный регистратор
     * @param {string|number} serviceId - ID выбранной услуги
     * @param doctor -ФИО врача
     * @returns {Promise<Object>} - результат регистрации { success, message, data? }
     */
    static async registerPatient(registrator, serviceId, doctor) {
        console.log('Doctor received:', doctor)
        if (!registrator) {
            throw new Error('Не выбран регистратор');
        }
        if (!registrator.ip) {
            console.error('Неполный объект регистратора:', registrator);
            throw new Error('Выбранный регистратор не содержит IP-адрес');
        }
        if (!serviceId) {
            throw new Error('Не выбрана услуга');
        }

        console.log(`🚀 Начинаем процесс регистрации для услуги ${serviceId} у регистратора ${registrator.name || registrator.ip}`);

        try {
            // Шаг 1: Получаем актуальные данные о филиалах
            console.log('📡 Шаг 1: Запрос данных филиала...');
            const branchesResponse = await ApiService.getCompanyBranches(registrator);

            if (!branchesResponse?.companyBranches?.length) {
                throw new Error('Не удалось получить данные о филиалах');
            }
            // Берем первый филиал (как и в loadCompanyData)
            const firstBranch = branchesResponse.companyBranches[0];
            console.log(`✅ Данные филиала "${firstBranch.defaultName || firstBranch.name}" получены`);

            // Шаг 2: Ищем первый свободный слот для выбранной услуги
            console.log(`🔍 Шаг 2: Поиск свободного слота для услуги ID=${serviceId}...`);
            const availableSlot = CompanyService.findFirstAvailableSlot(firstBranch, serviceId);

            if (!availableSlot) {
                throw new Error('Нет свободных слотов для выбранной услуги');
            }
            console.log(`✅ Найден слот: ${availableSlot.date} в ${availableSlot.time}`);

            // Шаг 3: Отправляем запрос на предварительную регистрацию
            console.log(`📡 Шаг 3: Отправка запроса на регистрацию...`);
            const registrationData = {
                companyBranchId: firstBranch.id,
                queueServiceId: serviceId,
                date: availableSlot.date,
                time: availableSlot.time,
                additionalInfo: "Отправил: " + doctor,
            };

            const registrationResult = await ApiService.createPreRegistration(registrationData, registrator);
            console.log(`🎉 Регистрация успешно завершена!`, registrationResult);

            // --- ИЗМЕНЕНИЕ: Извлекаем первую предрегистрацию из ответа ---
            const firstPreRegistration = registrationResult?.preRegistrations?.[0];

            if (!firstPreRegistration) {
                throw new Error('Неожиданный формат ответа от сервера');
            }

            return {
                success: true,
                message: 'Пациент успешно зарегистрирован',
                data: {
                    // Данные из ответа сервера
                    preregistrationId: firstPreRegistration.preregistrationId,
                    clientCode: firstPreRegistration.clientCode,
                    date: firstPreRegistration.date,
                    time: firstPreRegistration.time,
                    registrationTime: firstPreRegistration.registrationTime,
                    status: firstPreRegistration.status,

                    // Информация о филиале
                    branchName: firstPreRegistration.companyBranch?.defaultName ||
                        firstPreRegistration.companyBranch?.name ||
                        firstBranch.defaultName ||
                        'Не указан',

                    // Информация об услуге
                    serviceName: firstPreRegistration.queueService?.defaultName ||
                        firstPreRegistration.queueService?.name ||
                        'Не указана',

                    // Сохраняем слот для совместимости
                    slot: availableSlot
                }
            };

        } catch (error) {
            console.error('❌ Ошибка в процессе регистрации:', error);
            return {
                success: false,
                message: error.message || 'Произошла ошибка при регистрации'
            };
        }
    }
}
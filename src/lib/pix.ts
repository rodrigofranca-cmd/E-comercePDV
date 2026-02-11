
export class Pix {
    public static payload(key: string, merchant: string, city: string, txnId: string, amount: number): string {
        const format = (id: string, value: string) => {
            const len = value.length.toString().padStart(2, '0');
            return `${id}${len}${value}`;
        };

        const amtStr = amount.toFixed(2);

        // Merchant Account Information
        const gui = format('00', 'BR.GOV.BCB.PIX');
        const keyField = format('01', key); // Chave Pix
        const description = format('02', ''); // Descrição (opcional)
        const merchantAccount = format('26', `${gui}${keyField}${description}`);

        // Merchant Category Code (0000 - Not specified, or 6012 etc.)
        const mcc = format('52', '0000');

        // Transaction Currency (986 - BRL)
        const currency = format('53', '986');

        // Transaction Amount
        const amt = format('54', amtStr);

        // Country Code (BR)
        const country = format('58', 'BR');

        // Merchant Name
        const nameStr = merchant.substring(0, 25).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove accents
        const merchName = format('59', nameStr || 'MERCHANT');

        // Merchant City
        const cityStr = city.substring(0, 15).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const merchCity = format('60', cityStr || 'BRASIL');

        // Additional Data Field Template (TxID)
        const txIdField = format('05', txnId || '***');
        const additionalData = format('62', txIdField);

        // Payload without CRC
        const payload = `000201${merchantAccount}${mcc}${currency}${amt}${country}${merchName}${merchCity}${additionalData}6304`;

        // CRC16 Calculation
        const crc = this.crc16(payload);

        return `${payload}${crc}`;
    }

    private static crc16(payload: string): string {
        let crc = 0xFFFF;
        for (let i = 0; i < payload.length; i++) {
            crc ^= payload.charCodeAt(i) << 8;
            for (let j = 0; j < 8; j++) {
                if ((crc & 0x8000) > 0) {
                    crc = (crc << 1) ^ 0x1021;
                } else {
                    crc = crc << 1;
                }
            }
        }
        return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    }
}

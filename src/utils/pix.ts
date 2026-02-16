// Utilitário para gerar payload PIX (BRCode) manualmente
// Segue especificação do Banco Central do Brasil

export interface PixConfig {
  key: string;
  name: string;
  city: string;
  transactionId?: string;
  value?: number;
}

export function generatePixPayload(config: PixConfig): string {
  const { key, name, city, transactionId = "***", value } = config;
  
  // Limpar e formatar dados
  const cleanName = name.substring(0, 25).toUpperCase();
  const cleanCity = city.substring(0, 15).toUpperCase();
  const txid = transactionId.substring(0, 25);
  
  // ID do payload
  let payload = "000201";
  
  // Merchant Account Information - PIX
  const merchantAccount = buildMerchantAccount(key);
  payload += merchantAccount;
  
  // Merchant Category Code (0000 = não especificado)
  payload += "52040000";
  
  // Transaction Currency (986 = BRL)
  payload += "5303986";
  
  // Transaction Amount (se houver valor)
  if (value && value > 0) {
    const amount = value.toFixed(2);
    payload += `54${String(amount.length).padStart(2, "0")}${amount}`;
  }
  
  // Country Code (BR)
  payload += "5802BR";
  
  // Merchant Name
  payload += `59${String(cleanName.length).padStart(2, "0")}${cleanName}`;
  
  // Merchant City
  payload += `60${String(cleanCity.length).padStart(2, "0")}${cleanCity}`;
  
  // Additional Data Field Template (TXID)
  const additionalData = `0503${txid}`;
  payload += `62${String(additionalData.length).padStart(2, "0")}${additionalData}`;
  
  // CRC16
  payload += "6304";
  payload += calculateCRC16(payload);
  
  return payload;
}

function buildMerchantAccount(key: string): string {
  // GUI do PIX no Brasil
  const gui = "br.gov.bcb.pix";
  
  // Identificador da chave PIX
  let keyType: string;
  let keyValue = key;
  
  // Detectar tipo de chave
  if (key.includes("@")) {
    keyType = "01"; // Email
  } else if (/^\d{11}$/.test(key.replace(/\D/g, ""))) {
    keyType = "02"; // CPF
    keyValue = key.replace(/\D/g, "");
  } else if (/^\d{14}$/.test(key.replace(/\D/g, ""))) {
    keyType = "03"; // CNPJ
    keyValue = key.replace(/\D/g, "");
  } else if (/^\+?\d{10,14}$/.test(key.replace(/\s/g, ""))) {
    keyType = "04"; // Telefone
    keyValue = key.replace(/\D/g, "");
    if (!keyValue.startsWith("55")) {
      keyValue = "55" + keyValue;
    }
  } else {
    keyType = "05"; // Chave aleatória (EVP)
  }
  
  // Construir Merchant Account Information
  // ID 26 = PIX no BR Code
  const guiField = `00${String(gui.length).padStart(2, "0")}${gui}`;
  const keyField = `${keyType}${String(keyValue.length).padStart(2, "0")}${keyValue}`;
  const merchantAccount = guiField + keyField;
  
  return `26${String(merchantAccount.length).padStart(2, "0")}${merchantAccount}`;
}

function calculateCRC16(str: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;
  
  for (let i = 0; i < str.length; i++) {
    const byte = str.charCodeAt(i);
    crc ^= byte << 8;
    
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc <<= 1;
      }
      crc &= 0xFFFF;
    }
  }
  
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

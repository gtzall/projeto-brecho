// Utilitário para gerar payload PIX (BRCode) manualmente
// Segue especificação do Banco Central do Brasil

export interface PixConfig {
  key: string;
  name: string;
  city: string;
  transactionId?: string;
  value?: number;
}

export interface PixKeyInfo {
  type: "cpf" | "cnpj" | "email" | "phone" | "random";
  typeLabel: string;
  value: string;
  originalKey: string;
}

export function detectPixKeyType(key: string): PixKeyInfo {
  const cleanKey = key.trim();
  const numbersOnly = cleanKey.replace(/\D/g, "");
  
  // Email
  if (cleanKey.includes("@")) {
    return {
      type: "email",
      typeLabel: "E-mail",
      value: cleanKey.toLowerCase(),
      originalKey: cleanKey,
    };
  }
  
  // CPF (11 dígitos)
  if (numbersOnly.length === 11) {
    return {
      type: "cpf",
      typeLabel: "CPF",
      value: numbersOnly,
      originalKey: cleanKey,
    };
  }
  
  // CNPJ (14 dígitos)
  if (numbersOnly.length === 14) {
    return {
      type: "cnpj",
      typeLabel: "CNPJ",
      value: numbersOnly,
      originalKey: cleanKey,
    };
  }
  
  // Telefone (10-13 dígitos, com ou sem +55)
  if (numbersOnly.length >= 10 && numbersOnly.length <= 14) {
    let phoneValue = numbersOnly;
    // Adicionar 55 se não tiver
    if (!phoneValue.startsWith("55") && phoneValue.length <= 11) {
      phoneValue = "55" + phoneValue;
    }
    return {
      type: "phone",
      typeLabel: "Telefone",
      value: phoneValue,
      originalKey: cleanKey,
    };
  }
  
  // Chave aleatória (EVP) - geralmente 36 caracteres com hífens
  return {
    type: "random",
    typeLabel: "Chave Aleatória",
    value: cleanKey,
    originalKey: cleanKey,
  };
}

export function generatePixPayload(config: PixConfig): { payload: string; keyInfo: PixKeyInfo } {
  const { key, name, city, transactionId = "***", value } = config;
  
  // Detectar tipo de chave
  const keyInfo = detectPixKeyType(key);
  
  console.log("PIX - Tipo de chave detectado:", keyInfo);
  
  // Limpar e formatar dados
  const cleanName = name.substring(0, 25).toUpperCase();
  const cleanCity = city.substring(0, 15).toUpperCase();
  const txid = transactionId.substring(0, 25);
  
  // Mapear tipo de chave para código do BR Code
  const typeMap: Record<string, string> = {
    email: "01",
    cpf: "02", 
    cnpj: "03",
    phone: "04",
    random: "05",
  };
  
  const keyType = typeMap[keyInfo.type];
  const keyValue = keyInfo.value;
  
  // ID do payload
  let payload = "000201";
  
  // Merchant Account Information - PIX
  const merchantAccount = buildMerchantAccount(keyType, keyValue);
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
  const additionalData = `05${String(txid.length).padStart(2, "0")}${txid}`;
  payload += `62${String(additionalData.length).padStart(2, "0")}${additionalData}`;
  
  // CRC16
  payload += "6304";
  payload += calculateCRC16(payload);
  
  return { payload, keyInfo };
}

function buildMerchantAccount(keyType: string, keyValue: string): string {
  // GUI do PIX no Brasil
  const gui = "br.gov.bcb.pix";
  
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

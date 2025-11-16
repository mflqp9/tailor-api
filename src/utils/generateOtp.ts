// utils/generateOtp.ts

/**
 * Generate a numeric OTP (default length = 6)
 * @param length - number of digits in the OTP
 * @returns string OTP (e.g. "482931")
 */
export function generateOtp(length: number = 6): string {
    if (length <= 0) throw new Error("OTP length must be greater than zero");
  
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
  
    return Math.floor(min + Math.random() * (max - min)).toString();
  }
  
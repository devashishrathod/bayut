export function buildWhatsAppInquiryUrl({
  phone,
  title,
  propertyUrl,
}: {
  phone: string;
  title: string;
  propertyUrl: string;
}) {
  const message = `Hi! I’m interested in ${title} advertised on Bayut.\n\n${propertyUrl}\n\n*Kindly do not edit this message to ensure your inquiry is received.`;
  const text = encodeURIComponent(message);
  return `https://api.whatsapp.com/send/?phone=${encodeURIComponent(
    phone,
  )}&text=${text}&type=phone_number&app_absent=0`;
}

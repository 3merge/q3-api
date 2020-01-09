const deconstructorPhoneNumber = (value) => {
  const PhoneNumber = {};
  const sanitized = value.replace(/\D/g, '');

  if (value.length === 10) {
    PhoneNumber.CountryCode = sanitized.charAt(0);
    PhoneNumber.AreaCode = sanitized.substr(1, 4);
    PhoneNumber.Phone = sanitized.substr(4, 9);
  } else {
    PhoneNumber.CountryCode = '1';
    PhoneNumber.AreaCode = sanitized.substr(0, 3);
    PhoneNumber.Phone = sanitized.substr(3, 8);
  }

  return PhoneNumber;
};

module.exports = function normalizeAddressListing() {
  const {
    streetNumber,
    streetLine1,
    streetLine2,
    firstName,
    lastName,
    city,
    country,
    region,
    postal,
    phone1,
    email,
  } = this;

  return {
    purolator: () => ({
      Address: {
        Name: `${firstName} ${lastName}`,
        StreetNumber: streetNumber,
        StreetName: streetLine1,
        City: city,
        Province: region,
        Country: country,
        PostalCode: postal,
        PhoneNumber: deconstructorPhoneNumber(phone1),
      },
    }),

    bambora: () => ({
      name: `${firstName} ${lastName}`,
      province: region,
      address_line1: `${streetNumber} ${streetLine1}`,
      address_line2: streetLine2,
      postal_code: postal,
      phone_number: phone1,
      email_address: email,
      city,
      country,
    }),
  };
};

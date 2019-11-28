# Sample JSON

## An open order

{% hint style="info" %}
This is just an example exported from an integration test. Some field are missing and some calculations bypassed.
{% endhint %}

{% code title="demo.json" %}
```javascript
{
  "_id": "5ddc32d9f15aca4f4cf72cbb",
  "po": "1234",
  "invoice": "num2019",
  "transactionID": null,
  "rebateCodes": [],
  "draft": false,
  "status": "Open",
  "pst": 0,
  "gst": 5,
  "hst": 9,
  "paymentFee": 1.99,
  "shippingFee": 11.99,
  "currency": "CAD", 
  "rate": 1.36,
  "globalDiscount": 2, 
  "subtotal": 187.67, 
  "tax": 26.27, 
  "total": 213.94, 
  "items": [
    {
      "_id": "5ddc32d9f15aca4f4cf72cbd",
      "product": "5ddc32d9f15aca4f4cf72cbc",
      "unmodifiedPrice": {
        "retail": 96.99
      },
      "subtotal": 128.04,
      "currency": "CAD",
      "discounts": [
        {
          "global": true,
          "factor": 0.12,
          "complimentary": false,
          "_id": "5ddc32d9f15aca4f4cf72cc2",
          "kind": "Retail"
        }
      ],
      "rebates": [],
      "price": [
        {
          "_id": "5ddc32d9f15aca4f4cf72cc4",
          "value": 11.64,
          "amount": 11
        }
      ],
      "quantity": 11,
      "bucket": {
        "sku": "MAN_SKU",
        "description": "Desc of product"
      }
    },
    {
      "_id": "5ddc32d9f15aca4f4cf72cc1",
      "product": "5ddc32d9f15aca4f4cf72cc0",
      "unmodifiedPrice": {
        "retail": 96.99
      },
      "subtotal": 47.49,
      "currency": "USD",
      "quantity": 3,
      "discounts": [
        {
          "global": true,
          "factor": 0.12,
          "complimentary": false,
          "_id": "5ddc32d9f15aca4f4cf72cc3",
          "kind": "Retail"
        }
      ],
      "rebates": [],
      "price": [
        {
          "_id": "5ddc32d9f15aca4f4cf72cc5",
          "value": 11.64,
          "amount": 3
        }
      ],
      "bucket": {
        "sku": "MAN_SKU",
        "description": "Desc of product"
      }
    }
  ],
  "createdAt": "2019-11-25T20:00:25.351Z",
  "updatedAt": "2019-11-25T20:00:25.413Z",
  "__v": 2
}
```
{% endcode %}




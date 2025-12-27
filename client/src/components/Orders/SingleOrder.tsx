import React, { useState } from "react";
import Link from "next/link";
import OrderActions from "./OrderActions";
import OrderModal from "./OrderModal";

const SingleOrder = ({ orderItem, smallView }: any) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const toggleEdit = () => {
    setShowEdit(!showEdit);
  };

  const toggleModal = (status: boolean) => {
    setShowDetails(status);
    setShowEdit(status);
  };

  // Get order ID from rawOrder or orderId
  const orderId = orderItem.rawOrder?.id || orderItem.id;

  return (
    <>
      {!smallView && (
        <div className="items-center justify-between border-t border-gray-3 py-5 px-7.5 hidden md:flex">
          <div className="min-w-[111px]">
            <Link href={`/orders/${orderId}`} className="text-custom-sm text-red hover:underline">
              #{orderItem.orderId}
            </Link>
          </div>
          <div className="min-w-[175px]">
            <p className="text-custom-sm text-dark">{orderItem.createdAt}</p>
          </div>

          <div className="min-w-[128px]">
            <p
              className={`inline-block text-custom-sm  py-0.5 px-2.5 rounded-[30px] capitalize ${
                orderItem.status === "delivered"
                  ? "text-green bg-green-light-6"
                  : orderItem.status === "on-hold"
                  ? "text-red bg-red-light-6"
                  : orderItem.status === "processing"
                  ? "text-yellow bg-yellow-light-4"
                  : "text-gray-6 bg-gray-3"
              }`}
            >
              {orderItem.status}
            </p>
          </div>

          <div className="min-w-[213px]">
            <p className="text-custom-sm text-dark">{orderItem.title}</p>
          </div>

          <div className="min-w-[113px]">
            <p className="text-custom-sm text-dark">{orderItem.total}</p>
          </div>

          <div className="flex gap-5 items-center">
            <Link
              href={`/orders/${orderId}`}
              className="hover:bg-gray-2 rounded-sm p-2 inline-flex"
              title="Xem chi tiết"
            >
              <svg
                width="18"
                height="16"
                viewBox="0 0 18 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.99935 4.87504C7.27346 4.87504 5.87435 6.27415 5.87435 8.00004C5.87435 9.72593 7.27346 11.125 8.99935 11.125C10.7252 11.125 12.1243 9.72593 12.1243 8.00004C12.1243 6.27415 10.7252 4.87504 8.99935 4.87504ZM7.12435 8.00004C7.12435 6.96451 7.96382 6.12504 8.99935 6.12504C10.0349 6.12504 10.8743 6.96451 10.8743 8.00004C10.8743 9.03557 10.0349 9.87504 8.99935 9.87504C7.96382 9.87504 7.12435 9.03557 7.12435 8.00004Z"
                  fill="#495270"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.99935 0.708374C5.23757 0.708374 2.70376 2.96187 1.23315 4.87243L1.20663 4.90687C0.874048 5.33882 0.567732 5.73664 0.359922 6.20704C0.137386 6.71077 0.0410156 7.25978 0.0410156 8.00004C0.0410156 8.7403 0.137386 9.28932 0.359922 9.79304C0.567734 10.2634 0.87405 10.6613 1.20664 11.0932L1.23316 11.1277C2.70376 13.0382 5.23757 15.2917 8.99935 15.2917C12.7611 15.2917 15.2949 13.0382 16.7655 11.1277L16.792 11.0932C17.1246 10.6613 17.431 10.2634 17.6388 9.79304C17.8613 9.28932 17.9577 8.7403 17.9577 8.00004C17.9577 7.25978 17.8613 6.71077 17.6388 6.20704C17.431 5.73663 17.1246 5.33881 16.792 4.90685L16.7655 4.87243C15.2949 2.96187 12.7611 0.708374 8.99935 0.708374ZM2.2237 5.63487C3.58155 3.87081 5.79132 1.95837 8.99935 1.95837C12.2074 1.95837 14.4172 3.87081 15.775 5.63487C16.1405 6.1097 16.3546 6.39342 16.4954 6.71216C16.627 7.01005 16.7077 7.37415 16.7077 8.00004C16.7077 8.62593 16.627 8.99003 16.4954 9.28792C16.3546 9.60666 16.1405 9.89038 15.775 10.3652C14.4172 12.1293 12.2074 14.0417 8.99935 14.0417C5.79132 14.0417 3.58155 12.1293 2.2237 10.3652C1.85821 9.89038 1.64413 9.60666 1.50332 9.28792C1.37171 8.99003 1.29102 8.62593 1.29102 8.00004C1.29102 7.37415 1.37171 7.01005 1.50332 6.71216C1.64413 6.39342 1.85821 6.1097 2.2237 5.63487Z"
                  fill="#495270"
                />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {smallView && (
        <div className="block md:hidden">
          <div className="py-4.5 px-7.5">
            <div className="">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2"> Order:</span>{' '}
                <Link href={`/orders/${orderId}`} className="text-red hover:underline">
                  #{orderItem.orderId}
                </Link>
              </p>
            </div>
            <div className="">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Date:</span>{" "}
                {orderItem.createdAt}
              </p>
            </div>

            <div className="">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Status:</span>{" "}
                <span
                  className={`inline-block text-custom-sm  py-0.5 px-2.5 rounded-[30px] capitalize ${
                    orderItem.status === "delivered"
                      ? "text-green bg-green-light-6"
                      : orderItem.status === "on-hold"
                      ? "text-red bg-red-light-6"
                      : orderItem.status === "processing"
                      ? "text-yellow bg-yellow-light-4"
                      : "text-gray-6 bg-gray-3"
                  }`}
                >
                  {orderItem.status}
                </span>
              </p>
            </div>

            <div className="">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Title:</span> {orderItem.title}
              </p>
            </div>

            <div className="">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Total:</span>{" "}
                {orderItem.total}
              </p>
            </div>

            <div className="mt-3">
              <Link
                href={`/orders/${orderId}`}
                className="inline-block bg-blue text-white px-4 py-2 rounded-md text-sm hover:bg-blue-dark transition-colors"
              >
                Xem chi tiết
              </Link>
            </div>
          </div>
        </div>
      )}

      <OrderModal
        showDetails={showDetails}
        showEdit={showEdit}
        toggleModal={toggleModal}
        order={orderItem}
      />
    </>
  );
};

export default SingleOrder;

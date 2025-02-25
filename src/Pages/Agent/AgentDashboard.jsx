import { useState } from 'react';
import useUser from '../../Hooks/useUser';
import Header from '../Header/Header';
import useTransaction from '../../Hooks/useTansction';
import TransctionPage from '../User/TransctionPage';
import { toast } from 'react-toastify';
import { axiosPublic } from '../../Hooks/usePublic';

export default function AgentDashboard() {
  const [activeTab, setActiveTab] = useState('cash-in');
  const [isProcessing, setIsProcessing] = useState(false); 
  const [showBalance, setShowBalance] = useState(false);
  const { profile, refetch } = useUser();
  const [transactions] = useTransaction(profile?.mobile, profile?._id);
  const transactionsData = transactions?.data;
  const filteredTransactions = transactionsData?.filter(
    (tran) =>
      tran?.senderId?._id === profile?._id || tran?.receiverNumber === profile?.mobile
  );

  if (!profile) {
    refetch();
    return window.location.href = '/';
  }

 // Add isProcessing state

  const handleShowBalance = () => {
    setShowBalance(true);
    setTimeout(() => {
      setShowBalance(false);
    }, 5000);
  };

  const handleCashIn = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
  
    const amount = Number(e.target.amount.value);
    const pin = e.target.pinNumber.value;
    const receiverNumber = e.target.userNamber.value;
    const fee = 0;
    const type = "CashIn";
    const senderId = profile?._id;
    const transactionId = '';
  
    if (amount < 50) {
      toast.warning("Amount should be greater than 50");
      setIsProcessing(false);
      return;
    } else if (receiverNumber.length !== 11) {
      toast.warning("Invalid mobile number. Please enter an 11-digit number");
      setIsProcessing(false);
      return;
    } else if (pin.length !== 5) {
      toast.warning("Invalid Pin, Pin Must be 5 characters long");
      setIsProcessing(false);
      return;
    }
  
    const data = {
      amount,
      receiverNumber,
      pin,
      fee,
      type,
      transactionId,
      senderId
    };
  
    try {
      const response = await axiosPublic.post('/cashIn/create-cashIn', data);
      toast.success(`✅ Cash In Success. ৳${response.data.data.amount} to ${response.data.data.receiverNumber} (Fee: ৳${response.data.data.fee})`);
      refetch();
      handleShowBalance();
      setIsProcessing(false);
  
      if (Notification.permission === "granted") {
        const updatedBalance = profile?.balance - amount - fee;
        new Notification(`💳 Your balance has been updated: ৳${updatedBalance}`);
      } else {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            const updatedBalance = profile?.balance - amount - fee;
            new Notification(`💳 Your balance has been updated: ৳${updatedBalance}`);
          }
        });
      }
      console.log(response);
    } catch (err) {
      let errorMessage = "Something went wrong!";
  
      if (err.response) {
        const contentType = err.response.headers["content-type"];
        if (contentType?.includes("text/html")) {
          const regex = /Error:\s(.+?)\./;
          const match = err.response.data.match(regex);
          errorMessage = match ? `Error: ${match[1]}.` : "An unexpected error occurred.";
        } else {
          errorMessage = err.response.data.message || "Receiver Number Not Found!";
        }
        toast.error(`🚫 ${errorMessage}`);
        console.error("Server error:", errorMessage);
      } else if (err.request) {
        toast.error("📡 Network error. Please try again later.");
        console.error("Network error:", err.request);
      } else {
        toast.error(`⚠️ ${err.message || errorMessage}`);
        console.error("Request error:", err.message);
      }
      setIsProcessing(false);
    }
  };
  

  return (
    <div className="max-w-6xl mx-auto py-10">
      <div className="flex justify-between items-center">
        <h1 className="md:text-3xl font-bold mb-6">Agent Dashboard</h1>
        <Header />
      </div>

      <div className="grid gap-6">
        <div className="border border-gray-200 rounded-lg shadow p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Balance</h2>
            <p className="text-sm text-gray-500">Click to reveal your balance and income</p>
          </div>
          {showBalance ? (
            <p className="text-lg font-semibold"><span className='text-red-500'>{profile?.balance}</span> Tk</p>
          ) : (
            <button className="w-full border  border-gray-200 cursor-pointer rounded-lg py-2 hover:bg-gray-100" onClick={handleShowBalance}>
              Show Balance and Income
            </button>
          )}
        </div>

        {profile?.isApproved ? (
          <div>
            <div className="flex space-x-2 mb-4 md:flex-row flex-col">
              <button
                className={`flex-1 border-gray-200 border rounded-lg py-2 hover:cursor-pointer  ${activeTab === 'cash-in' ? 'bg-blue-500 text-white' : ''}`}
                onClick={() => setActiveTab('cash-in')}
              >
                Cash In
              </button>
              <button
                className={`flex-1 border-gray-200 border rounded-lg py-2 hover:cursor-pointer ${activeTab === 'balance-recharge' ? 'bg-blue-500 text-white' : ''}`}
                onClick={() => setActiveTab('balance-recharge')}
              >
                Balance Recharge
              </button>
              <button
                className={`flex-1 border-gray-200 border rounded-lg py-2 hover:cursor-pointer ${activeTab === 'withdraw' ? 'bg-blue-500 text-white' : ''}`}
                onClick={() => setActiveTab('withdraw')}
              >
                Withdraw
              </button>
            </div>

            {activeTab === 'cash-in' && (
              <div className="border border-gray-200 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">Cash In</h2>
                <p className="text-sm text-gray-500 mb-4">Process cash in for users</p>
                <form onSubmit={handleCashIn}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="user" className="block text-sm font-medium">User Number</label>
                      <input required name='userNamber' id="user" className="w-full border border-gray-200  rounded-lg p-2" placeholder="Enter user's number" />
                    </div>
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium">Amount</label>
                      <input required name='amount' id="amount" type="number" className="w-full border border-gray-200  rounded-lg p-2" placeholder="Enter amount" />
                    </div>
                    <div>
                      <label htmlFor="pin" className="block text-sm font-medium">Agent PIN</label>
                      <input id="pin" required name='pinNumber' type="password" className="w-full border border-gray-200  rounded-lg p-2" placeholder="Enter your PIN" />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-4 border border-gray-200 cursor-pointer rounded-lg py-2 hover:bg-gray-100"
                    disabled={isProcessing} // Disable the button while processing
                  >
                    {isProcessing ? (
                      <span>Processing...</span>
                    ) : (
                      "Process Cash In"
                    )}
                  </button>
                </form>
              </div>
            )}
            {/* Other tabs code remains the same */}
          </div>
        ) : (
          <h1 className='text-center text-red-500 font-semibold'>Wait for agent approval</h1>
        )}

        <div className="border rounded-lg shadow p-6 border-gray-200 ">
          <h2 className="text-xl font-semibold mb-2">Transaction History</h2>
          <p className="text-sm text-gray-500 mb-4">Your last 100 transactions</p>
          <div>
            <TransctionPage filteredTransactions={filteredTransactions} />
          </div>
        </div>
      </div>
    </div>
  );
}

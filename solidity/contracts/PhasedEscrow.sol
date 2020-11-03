pragma solidity 0.5.17;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";

interface IBeneficiaryContract {
    function __escrowSentTokens(uint256 amount) external;
}

/// @title PhasedEscrow
/// @notice A token holder contract allowing contract owner to set beneficiary of
///         tokens held by the contract and allowing the owner to withdraw the
///         tokens to that beneficiary in phases.
contract PhasedEscrow is Ownable {
    using SafeERC20 for IERC20;

    event BeneficiaryUpdated(address beneficiary);
    event TokensWithdrawn(address beneficiary, uint256 amount);

    IERC20 public token;
    IBeneficiaryContract public beneficiary;

    constructor(IERC20 _token) public {
        token = _token;
    }

    /// @notice Sets the provided address as a beneficiary allowing it to
    ///         withdraw all tokens from escrow. This function can be called only
    ///         by escrow owner.
    function setBeneficiary(IBeneficiaryContract _beneficiary) external onlyOwner {
        beneficiary = _beneficiary;
        emit BeneficiaryUpdated(address(beneficiary));
    }

    /// @notice Withdraws the specified number of tokens from escrow to the
    ///         beneficiary. If the beneficiary is not set, or there are
    ///         insufficient tokens in escrow, the function fails.
    function withdraw(uint256 amount) external onlyOwner {
        require(address(beneficiary) != address(0), "Beneficiary not assigned");

        uint256 balance = token.balanceOf(address(this));
        require(amount <= balance, "Not enough tokens for withdrawal");

        token.safeTransfer(address(beneficiary), amount);
        emit TokensWithdrawn(address(beneficiary), amount);

        beneficiary.__escrowSentTokens(amount);
    }
}

interface ICurveRewards {
    function notifyRewardAmount(uint256 amount) external;
}

/// @title CurveRewardsEscrowBeneficiary
/// @notice A beneficiary contract that can receive a withdrawal phase from a
///         PhasedEscrow contract. Immediately stakes the received tokens on a
///         designated CurveRewards contract.
contract CurveRewardsEscrowBeneficiary is Ownable {
    IERC20 public token;
    ICurveRewards public curveRewards;

    constructor(IERC20 _token, ICurveRewards _curveRewards) public {
        token = _token;
        curveRewards = _curveRewards;
    }

    function __escrowSentTokens(uint256 amount) external {
        token.approve(address(curveRewards), amount);
        curveRewards.notifyRewardAmount(amount);
    }
}

/// @dev Interface of recipient contract for approveAndCall pattern.
interface IStakerRewards { function receiveApproval(address _from, uint256 _value, address _token, bytes calldata _extraData) external; }

contract BeaconBackportRewardsEscrowBeneficiary is Ownable {
    IERC20 public token;
    IStakerRewards public stakerRewards;

    constructor(IERC20 _token, IStakerRewards _stakerRewards) public {
        token = _token;
        stakerRewards = _stakerRewards;
    }

    function __escrowSentTokens(uint256 amount) external {
        token.approve(address(stakerRewards), amount);
        stakerRewards.receiveApproval(msg.sender, amount, address(token), "");
    }
}

contract BeaconRewardsEscrowBeneficiary is Ownable {
    // TODO: implement similar to BeaconBackportRewardsEscrowBeneficiary
}

contract ECDSABackportRewardsEscrowBeneficiary is Ownable {
    // TODO: implement similar to BeaconBackportRewardsEscrowBeneficiary
}

contract ECDSARewardsEscrowBeneficiary is Ownable {
    // TODO: implement similar to BeaconBackportRewardsEscrowBeneficiary
}
import type { CSSProperties } from 'react'
import arrowUpDown from '../assets/Icon/arrow-up-down.svg'
import baggageClaim from '../assets/Icon/baggage-claim.svg'
import bookOpen from '../assets/Icon/book-open.svg'
import briefcase from '../assets/Icon/briefcase-business.svg'
import car from '../assets/Icon/car-front.svg'
import chevronDown from '../assets/Icon/chevron-down.svg'
import chevronLeft from '../assets/Icon/chevron-left.svg'
import chevronRight from '../assets/Icon/chevron-right.svg'
import chevronUp from '../assets/Icon/chevron-up.svg'
import circleArrowDown from '../assets/Icon/circle-arrow-down.svg'
import circleArrowUp from '../assets/Icon/circle-arrow-up.svg'
import dumbbell from '../assets/Icon/dumbbell.svg'
import eye from '../assets/Icon/eye.svg'
import eyeClosed from '../assets/Icon/eye-closed.svg'
import gift from '../assets/Icon/gift.svg'
import heart from '../assets/Icon/heart-pulse.svg'
import house from '../assets/Icon/house.svg'
import lock from '../assets/Icon/lock.svg'
import logIn from '../assets/Icon/log-in.svg'
import logOut from '../assets/Icon/log-out.svg'
import mail from '../assets/Icon/mail.svg'
import mailbox from '../assets/Icon/mailbox.svg'
import pawPrint from '../assets/Icon/paw-print.svg'
import piggyBank from '../assets/Icon/piggy-bank.svg'
import plus from '../assets/Icon/plus.svg'
import receiptText from '../assets/Icon/receipt-text.svg'
import search from '../assets/Icon/search.svg'
import shoppingCart from '../assets/Icon/shopping-cart.svg'
import squarePen from '../assets/Icon/square-pen.svg'
import tag from '../assets/Icon/tag.svg'
import ticket from '../assets/Icon/ticket.svg'
import toolCase from '../assets/Icon/tool-case.svg'
import trash from '../assets/Icon/trash.svg'
import userRound from '../assets/Icon/user-round.svg'
import userRoundPlus from '../assets/Icon/user-round-plus.svg'
import utensils from '../assets/Icon/utensils.svg'
import wallet from '../assets/Icon/wallet.svg'
import x from '../assets/Icon/x.svg'

interface IconProps { size?: number; className?: string; strokeWidth?: number }
function assetIcon(source: string) {
  return function Icon({ size = 24, className = '' }: IconProps) {
    // The exported 24 × 24 SVG is kept intact. Its wrapper controls scale and tone.
    const style = { width: size, height: size, '--icon-url': `url("${source}")`, '--icon-scale': size / 24 } as CSSProperties
    return <span className={`asset-icon ${className}`} style={style} aria-hidden="true"><span className="asset-icon-glyph" /></span>
  }
}
export const ArrowDownUp = assetIcon(arrowUpDown)
export const BaggageClaim = assetIcon(baggageClaim)
export const BookOpen = assetIcon(bookOpen)
export const BriefcaseBusiness = assetIcon(briefcase)
export const Car = assetIcon(car)
export const ChevronDown = assetIcon(chevronDown)
export const ChevronLeft = assetIcon(chevronLeft)
export const ChevronRight = assetIcon(chevronRight)
export const ChevronUp = assetIcon(chevronUp)
export const CircleArrowDown = assetIcon(circleArrowDown)
export const CircleArrowUp = assetIcon(circleArrowUp)
export const Dumbbell = assetIcon(dumbbell)
export const Eye = assetIcon(eye)
export const EyeOff = assetIcon(eyeClosed)
export const Gift = assetIcon(gift)
export const Heart = assetIcon(heart)
export const House = assetIcon(house)
export const LockKeyhole = assetIcon(lock)
export const LogIn = assetIcon(logIn)
export const LogOut = assetIcon(logOut)
export const Mail = assetIcon(mail)
export const Mailbox = assetIcon(mailbox)
export const PawPrint = assetIcon(pawPrint)
export const PiggyBank = assetIcon(piggyBank)
export const Plus = assetIcon(plus)
export const ReceiptText = assetIcon(receiptText)
export const Search = assetIcon(search)
export const ShoppingCart = assetIcon(shoppingCart)
export const Pencil = assetIcon(squarePen)
export const Tag = assetIcon(tag)
export const Ticket = assetIcon(ticket)
export const ToolCase = assetIcon(toolCase)
export const Trash2 = assetIcon(trash)
export const UserRound = assetIcon(userRound)
export const UserRoundPlus = assetIcon(userRoundPlus)
export const Utensils = assetIcon(utensils)
export const Wallet = assetIcon(wallet)
export const X = assetIcon(x)

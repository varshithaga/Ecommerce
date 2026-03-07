from datetime import datetime, date, timedelta
import calendar
from django.utils import timezone
from typing import Tuple, Optional

def get_today_local_date() -> date:
    return date.today()

def month_start_end(year: int, month: int) -> Tuple[date, date]:
    first = date(year, month, 1)
    last = date(year, month, calendar.monthrange(year, month)[1])
    return first, last

def add_month(year: int, month: int, delta: int) -> Tuple[int, int]:
    total = year * 12 + (month - 1) + delta
    return total // 12, (total % 12) + 1

def get_period_range(period: str, start_date: Optional[str] = None, end_date: Optional[str] = None):
    today = get_today_local_date()
    year = today.year
    month = today.month

    if period == "today":
        return today, today

    if period == "yesterday":
        yesterday = today - timedelta(days=1)
        return yesterday, yesterday

    if period == "this_week":
        start = today - timedelta(days=today.weekday())
        end = start + timedelta(days=6)
        return start, end

    if period == "this_month":
        return month_start_end(year, month)

    if period == "last_month":
        y, m = add_month(year, month, -1)
        return month_start_end(y, m)

    if period == "this_quarter":
        q_start_month = ((month - 1) // 3) * 3 + 1
        q_end_month = q_start_month + 2
        start = date(year, q_start_month, 1)
        end = date(year, q_end_month, calendar.monthrange(year, q_end_month)[1])
        return start, end

    if period == "this_year":
        return date(year, 1, 1), date(year, 12, 31)

    if period == "custom_range":
        if not start_date or not end_date:
            return None, None
        try:
            s = datetime.strptime(start_date, "%Y-%m-%d").date()
            e = datetime.strptime(end_date, "%Y-%m-%d").date()
            if s > e:
                s, e = e, s
            return s, e
        except ValueError:
            return None, None

    return None, None

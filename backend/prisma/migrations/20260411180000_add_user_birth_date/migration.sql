-- Optional date of birth for upcoming-birthdays on admin HR dashboard
ALTER TABLE "User" ADD COLUMN "birthDate" TIMESTAMP(3);

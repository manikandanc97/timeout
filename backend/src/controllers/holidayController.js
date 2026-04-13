import prisma from '../prismaClient.js';
import { findHolidaysForOrgInDateRange } from '../lib/findHolidaysForOrgInDateRange.js';

const holidayResponseSelect = {
  id: true,
  date: true,
  name: true,
  organizationId: true,
};

const parseYearRange = (yearParam) => {
  if (yearParam != null && yearParam !== '') {
    const y = Number(yearParam);
    if (!Number.isInteger(y) || y < 1970 || y > 2100) {
      return { error: 'Invalid year' };
    }
    return {
      from: new Date(y, 0, 1),
      to: new Date(y, 11, 31, 23, 59, 59, 999),
    };
  }
  const now = new Date();
  const y = now.getFullYear();
  return {
    from: new Date(y - 1, 0, 1),
    to: new Date(y + 1, 11, 31, 23, 59, 59, 999),
  };
};

export const listHolidays = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Organization required' });
    }

    const range = parseYearRange(req.query.year);
    if (range.error) {
      return res.status(400).json({ message: range.error });
    }

    const holidays = await findHolidaysForOrgInDateRange(
      organizationId,
      range.from,
      range.to,
    );
    res.json(holidays);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createHoliday = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Organization required' });
    }

    const { name, date } = req.body ?? {};
    if (!name || !date) {
      return res.status(400).json({ message: 'Name and date are required' });
    }

    const d = new Date(`${String(date).trim().split('T')[0]}T12:00:00`);
    if (Number.isNaN(d.getTime())) {
      return res.status(400).json({ message: 'Invalid date' });
    }

    const holiday = await prisma.holiday.create({
      data: {
        name: String(name).trim(),
        date: d,
        organizationId,
      },
      select: holidayResponseSelect,
    });
    res.status(201).json(holiday);
  } catch (error) {
    if (error.code === 'P2002') {
      return res
        .status(409)
        .json({ message: 'A holiday already exists on this date' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateHoliday = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Organization required' });
    }

    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const existing = await prisma.holiday.findFirst({
      where: { id, organizationId },
      select: { id: true },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    const { name, date } = req.body ?? {};
    const data = {};

    if (name != null) data.name = String(name).trim();
    if (date != null) {
      const d = new Date(`${String(date).trim().split('T')[0]}T12:00:00`);
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({ message: 'Invalid date' });
      }
      data.date = d;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const holiday = await prisma.holiday.update({
      where: { id },
      data,
      select: holidayResponseSelect,
    });
    res.json(holiday);
  } catch (error) {
    if (error.code === 'P2002') {
      return res
        .status(409)
        .json({ message: 'A holiday already exists on this date' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteHoliday = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Organization required' });
    }

    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const existing = await prisma.holiday.findFirst({
      where: { id, organizationId },
      select: { id: true },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    await prisma.holiday.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

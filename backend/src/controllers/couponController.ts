import { Request, Response } from 'express';
import Coupon from '../models/Coupon';

export const getCoupons = async (req: Request, res: Response) => {
    try {
        const coupons = await Coupon.find();
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getCouponByCode = async (req: Request, res: Response) => {
    try {
        const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase(), isActive: true });
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found or inactive' });
        }
        res.json(coupon);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createCoupon = async (req: Request, res: Response) => {
    try {
        const existing = await Coupon.findOne({ code: req.body.code.toUpperCase() });
        if (existing) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }
        
        const coupon = await Coupon.create({
            ...req.body,
            code: req.body.code.toUpperCase()
        });
        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const updateCoupon = async (req: Request, res: Response) => {
    try {
        const updateData = { ...req.body };
        if (updateData.code) {
            updateData.code = updateData.code.toUpperCase();
        }
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        res.json(coupon);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const deleteCoupon = async (req: Request, res: Response) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        res.json({ message: 'Coupon removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

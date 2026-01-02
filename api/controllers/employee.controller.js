import Employee from "../models/employee.model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from 'bcryptjs';
export const signout = (req, res, next) => {
    try {
        res
          .clearCookie("access_token")
          .status(200)
          .json("User has been signed out");
      } catch (error) {
        next(error);
      }
}

export const updateEmployee = async (req, res, next) => {
  if (req.user.empId !== req.params.empId) {
    return next(errorHandler(403, 'You are not allowed to update this user'));
  }
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return next(errorHandler(400, 'Password must be at least 6 characters'));
    }
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }
  if (req.body.username) {
    if (req.body.username.length < 7 || req.body.username.length > 20) {
      return next(
        errorHandler(400, 'Username must be between 7 and 20 characters')
      );
    }
    if (req.body.username.includes(' ')) {
      return next(errorHandler(400, 'Username cannot contain spaces'));
    }
    if (req.body.username !== req.body.username.toLowerCase()) {
      return next(errorHandler(400, 'Username must be lowercase'));
    }
    if (!req.body.username.match(/^[a-zA-Z0-9_ ]+$/)) {
      return next(
        errorHandler(400, 'Username can only contain letters, numbers, spaces, and underscores')
      );
    }
  }

  // Validate phone number
  if (req.body.phone) {
    if (!/^\d{11}$/.test(req.body.phone)) {
      return next(errorHandler(400, 'Phone number must be exactly 11 digits'));
    }
  }


    try {
      const employee = await Employee.findById(req.params.empId);

      // If profile picture is being updated and there is an existing one with public_id, delete it
      if (req.body.profilePicture && employee.profilePicturePublicId) {
        if (req.body.profilePicture !== employee.profilePicture) {
            const { v2: cloudinary } = await import('cloudinary');
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET
            });
            await cloudinary.uploader.destroy(employee.profilePicturePublicId);
        }
      }

      const updatedEmployee = await Employee.findByIdAndUpdate(
        req.params.empId,
        {
          $set: {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            username: req.body.username,
            email: req.body.email,
            nic: req.body.nic,
            address: req.body.address,
            phone: req.body.phone,
            profilePicture: req.body.profilePicture,
            profilePicturePublicId: req.body.profilePicturePublicId,
            password: req.body.password,
          },
        },
        { new: true }
      );
      const { password, ...rest } = updatedEmployee._doc;
      res.status(200).json(rest);
    } catch (error) {
      next(error);
    }
};


export const getEmployees = async (req, res, next) => {
  if(!req.user.isAdmin) {
    return next(errorHandler(403, "You are not authorized to access employees details"));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === 'asc' ? 1 : -1;
    const employees = await Employee.find({
      ...(req.query.role && { role: req.query.role }),
      ...(req.query.empId && { _id: req.query.empId }),
      ...(req.query.searchTerm && {
        $or: [
          { firstname: { $regex: req.query.searchTerm, $options: 'i' }},
          { lastname: { $regex: req.query.searchTerm, $options: 'i' }},
          { username: { $regex: req.query.searchTerm, $options: 'i' }},
          { email: { $regex: req.query.searchTerm, $options: 'i' }},
          { nic: { $regex: req.query.searchTerm, $options: 'i' }},
          { address: { $regex: req.query.searchTerm, $options: 'i' }},
        ],
      }),
    })
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const employeesWithoutPassword = employees.map((employee) => {
      const { password, ...rest } = employee._doc;
      return rest;
    });

    const totalEmployees = await Employee.countDocuments(
      { role: req.query.role}
    );

    const totalShiftEmployees = await Employee.countDocuments({
      shift: req.query.shift,
    });

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthEmployees = await Employee.countDocuments({
      createdAt: { $gte: oneMonthAgo },
      role: req.query.role,
    });

    res.status(200).json({
      employees: employeesWithoutPassword,
      totalEmployees,
      totalShiftEmployees,
      lastMonthEmployees,
    });
  } catch (error) {
    next(error);
  }
}


export const deleteEmployee = async (req, res, next) => {
  if (!req.user.isAdmin && req.user.empId !== req.params.empId) {
    return next(errorHandler(403, "You are not allowed to delete this user"));
  }
  try {
    await Employee.findByIdAndDelete(req.params.empId);
    res.status(200).json("Employee has been deleted");
  } catch (error) {
    next(error);
  }
};
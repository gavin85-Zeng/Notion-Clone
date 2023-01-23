const mongoose = require('mongoose');
const crypto = require('crypto');
require('./connection');

const TaskSchema = new mongoose.Schema(
	{
		// _id: mongoose.Schema.Types.ObjectId,
		// _id: {
		// 	type: String,
		// 	default: () => crypto.randomUUID(),
		// },
		pageId: {
			type: String,
			required: true,
		},
		documentId: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			default: 'Untitled',
		},
		status: {
			type: String,
			default: 'Empty',
		},
		date: {
			type: Date,
			required: true,
		},
		isTrash: {
			type: Boolean,
			default: false,
		},
		comments: {
			type: Array,
		},
		custProps: {
			type: Array,
			default: [],
		},
		todoList: {
			type: Array,
		},
	},
	{
		versionKey: false, // disable create generate __v
		timestamps: { timestamps: true }, // auto generate {createdAt, updatedAt}
	},
);

const Task = mongoose.model('Task', TaskSchema);
module.exports.Task = Task;

module.exports.find = async (query) => {
	const task = await Task.find(query).sort({ date: 1 }).exec();
	return task;
};

module.exports.findById = async (id) => {
	const task = await Task.findById(id);
	return task;
};

module.exports.create = async (data) => {
	const task = await Task.create(data);
	return task;
};

module.exports.update = async (id, data) => {
	const task = await Task.findByIdAndUpdate(id, data, { new: true });
	return task;
};

module.exports.delete = async (id) => {
	let task = await Task.findById(id);

	if (task?.isTrash) {
		task = await Task.findByIdAndDelete(task.id);
	} else {
		task = await Task.findByIdAndUpdate(task.id, { isTrash: true });
	}
	return task;
};

module.exports.forceDelete = async (id) => {
	let task = await Task.findByIdAndDelete(id);
	return task;
};

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title = "Confirm Action", message, isDanger = false, confirmText = "Confirm", cancelText = "Cancel" }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-dark-100 rounded-2xl w-full max-w-md border border-dark-50 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-dark-50/50 flex justify-between items-center bg-dark-200/30">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isDanger ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-display font-bold text-white">
                {title}
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
              {message}
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-dark-50/50 flex gap-3 bg-dark-200/30">
            <button
              onClick={onClose}
              className="flex-1 btn bg-dark-300 text-white hover:bg-dark-400 py-2.5"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 btn py-2.5 ${isDanger ? 'bg-red-500 hover:bg-red-600 text-white border-transparent' : 'btn-primary'}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmModal;

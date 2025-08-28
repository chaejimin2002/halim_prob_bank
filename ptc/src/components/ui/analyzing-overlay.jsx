import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

export function AnalyzingOverlay({ label = "분석 중...", sublabel = "수식·기호를 추출하는 중입니다" }) {
  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
      <div className="bg-white/90 rounded-xl p-4 flex flex-col items-center gap-2 shadow-lg">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-5 h-5 text-blue-600" />
        </motion.div>
        <div className="text-sm font-medium text-gray-800">{label}</div>
        <div className="text-xs text-gray-500 text-center">{sublabel}</div>
      </div>
    </div>
  );
}

AnalyzingOverlay.propTypes = {
  label: PropTypes.string,
  sublabel: PropTypes.string,
};
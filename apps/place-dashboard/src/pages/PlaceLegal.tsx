import React, { useState, useEffect } from 'react';
import { Shield, FileText, Download, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface PlaceLegalProps {
  placeId: string;
  onBack?: () => void;
}

const PlaceLegal: React.FC<PlaceLegalProps> = ({ placeId, onBack }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Simulate legal documents data
    setDocuments([
      {
        id: 1,
        name: 'Business License',
        type: 'license',
        status: 'approved',
        uploadDate: '2024-01-15',
        expiryDate: '2025-01-15',
        fileSize: '2.3 MB',
        required: true
      },
      {
        id: 2,
        name: 'Health Permit',
        type: 'permit',
        status: 'pending',
        uploadDate: '2024-12-20',
        expiryDate: '2025-12-20',
        fileSize: '1.8 MB',
        required: true
      },
      {
        id: 3,
        name: 'Insurance Certificate',
        type: 'insurance',
        status: 'approved',
        uploadDate: '2024-06-10',
        expiryDate: '2025-06-10',
        fileSize: '3.1 MB',
        required: true
      },
      {
        id: 4,
        name: 'Tax Registration',
        type: 'tax',
        status: 'expired',
        uploadDate: '2023-03-20',
        expiryDate: '2024-03-20',
        fileSize: '1.2 MB',
        required: true
      }
    ]);

    setAgreements([
      {
        id: 1,
        title: 'Platform Service Agreement',
        version: '2.1',
        signedDate: '2024-01-15',
        status: 'active',
        type: 'service'
      },
      {
        id: 2,
        title: 'Privacy Policy Compliance',
        version: '1.3',
        signedDate: '2024-06-01',
        status: 'active',
        type: 'privacy'
      },
      {
        id: 3,
        title: 'Payment Processing Terms',
        version: '3.0',
        signedDate: '2024-08-15',
        status: 'pending_update',
        type: 'payment'
      }
    ]);
  }, [placeId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
      case 'pending_update':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'expired':
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
      case 'pending_update':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'expired':
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              Legal & Compliance
            </h1>
            <p className="text-gray-600 mt-1">Manage your legal documents and compliance status</p>
          </div>
          <button
            onClick={() => setIsUploading(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Compliance Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Approved</h3>
              <p className="text-2xl font-bold text-green-600">
                {documents.filter(d => d.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Pending</h3>
              <p className="text-2xl font-bold text-orange-600">
                {documents.filter(d => d.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Issues</h3>
              <p className="text-2xl font-bold text-red-600">
                {documents.filter(d => d.status === 'expired' || d.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Required Documents</h2>
          <p className="text-gray-600 text-sm mt-1">Upload and manage your business documentation</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className={`border-2 rounded-xl p-4 ${
                isExpiringSoon(doc.expiryDate) ? 'border-orange-200 bg-orange-50' :
                doc.status === 'expired' ? 'border-red-200 bg-red-50' :
                'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{doc.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>Uploaded: {doc.uploadDate}</span>
                        <span>Expires: {doc.expiryDate}</span>
                        <span>Size: {doc.fileSize}</span>
                      </div>
                      {isExpiringSoon(doc.expiryDate) && (
                        <p className="text-orange-600 text-xs font-medium mt-1">
                          ⚠️ Expires in {Math.ceil((new Date(doc.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(doc.status)}
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agreements Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Platform Agreements</h2>
          <p className="text-gray-600 text-sm mt-1">Review and manage your platform agreements</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {agreements.map((agreement) => (
              <div key={agreement.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{agreement.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>Version: {agreement.version}</span>
                        <span>Signed: {agreement.signedDate}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(agreement.status)}
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(agreement.status)}`}>
                        {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                    
                    <button className="px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg text-sm font-medium">
                      Review
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <FileText className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Document</h3>
              <p className="text-gray-600">Select the type of document you want to upload</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500">
                <option value="">Select document type</option>
                <option value="license">Business License</option>
                <option value="permit">Health Permit</option>
                <option value="insurance">Insurance Certificate</option>
                <option value="tax">Tax Registration</option>
              </select>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-600">Drag and drop your file here, or click to browse</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setIsUploading(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="flex-1 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceLegal;
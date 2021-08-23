const utils = require('./utils')

describe("ensure-index", () => {
  describe("ensureIndex", () => {
    utils.getUserInput = jest.fn()
    const mockCollection = {
      indexExists: jest.fn(),
      estimatedDocumentCount: jest.fn().mockReturnValue(700),
      createIndex: jest.fn(),
    };
    const mockDatabase = {
      collection() {
        return mockCollection;
      },
    };

    beforeEach(() => {
      mockCollection.indexExists.mockClear();
      mockCollection.estimatedDocumentCount.mockClear();
      mockCollection.createIndex.mockClear();
      utils.getUserInput.mockClear();
    });

    it("index does not exists and user says yes on prompt", async () => {
      //setup
      mockCollection.indexExists.mockReturnValue(false);
      utils.getUserInput.mockReturnValue(true);
      const collection = 'whatever';
      const expectedIndexObj = { accountId: 1, jobId: 1 }
      const expectedOptions = { background: true }

      //execute
      await utils.ensureIndex(mockDatabase, collection);

      //check
      expect(mockCollection.indexExists).toBeCalledTimes(1);
      expect(mockCollection.indexExists).toBeCalledWith("accountId_1_jobId_1");
      expect(mockCollection.estimatedDocumentCount).toBeCalledTimes(1);
      expect(utils.getUserInput).toBeCalledTimes(1);
      expect(mockCollection.createIndex).toBeCalledTimes(1);
      expect(mockCollection.createIndex).toBeCalledWith(expectedIndexObj, expectedOptions)
      });
    it("index does not exists and user says no on prompt", async () => {
      //setup
      mockCollection.indexExists.mockReturnValue(false);
      utils.getUserInput.mockReturnValue(false);
      const collection = 'whatever';

      //execute
      await utils.ensureIndex(mockDatabase, collection);

      //check
      expect(mockCollection.indexExists).toBeCalledTimes(1);
      expect(mockCollection.indexExists).toBeCalledWith("accountId_1_jobId_1");
      expect(mockCollection.estimatedDocumentCount).toBeCalledTimes(1);
      expect(utils.getUserInput).toBeCalledTimes(1);
      expect(mockCollection.createIndex).toBeCalledTimes(0);
      });
    it("index exists", async () => {
      //setup
      mockCollection.indexExists.mockReturnValue(true);
      const collection = 'whatever';

      //execute
      await utils.ensureIndex(mockDatabase, collection);

      //check
      expect(mockCollection.indexExists).toBeCalledTimes(1);
      expect(mockCollection.indexExists).toBeCalledWith("accountId_1_jobId_1");
      expect(mockCollection.estimatedDocumentCount).toBeCalledTimes(0);
      expect(utils.getUserInput).toBeCalledTimes(0);
      expect(mockCollection.createIndex).toBeCalledTimes(0);
      });
      
    });
  });
